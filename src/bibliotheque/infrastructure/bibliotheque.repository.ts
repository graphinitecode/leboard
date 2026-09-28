import type { ListPretsEnCoursQuery } from '@/bibliotheque/domain/interfaces/bibliotheque-repository.interface'
import type { LivreCatalogue, Pret } from '@/bibliotheque/domain/pret.entity'
import type { Exemplaire, Livre, Pret as PretDto } from '@/payload-types'
import { getAxiosErrorMessage } from '@/shared/infrastructure/axios-error'
import { httpClient } from '@/shared/infrastructure/http.client'

const mapDtoToPret = (dto: PretDto): Pret => {
  const eleve = typeof dto.eleve === 'object' ? dto.eleve : null
  const exemplaire = typeof dto.exemplaire === 'object' ? dto.exemplaire : null
  const livre = exemplaire && typeof exemplaire.livre === 'object' ? exemplaire.livre : null

  return {
    id: dto.id,
    eleveId: eleve?.id ?? 0,
    eleveLabel: eleve ? `${eleve.prenom} ${eleve.nom}` : null,
    exemplaireCode: exemplaire?.code ?? null,
    livreLabel: livre?.titre ?? null,
    dateEmprunt: dto.dateEmprunt ?? dto.createdAt ?? null,
    dateRetourPrevue: dto.dateRetourPrevue ?? null,
    dateRetourEffective: dto.dateRetourEffective ?? null,
  }
}

// Codes des exemplaires actuellement en prêt (depuis les prêts en cours, depth 1).
const codesEmpruntesDepuisPrets = (prets: PretDto[]): Set<string> => {
  const codes = new Set<string>()
  for (const pret of prets) {
    if (typeof pret.exemplaire === 'object' && pret.exemplaire?.code) {
      codes.add(pret.exemplaire.code)
    }
  }
  return codes
}

export const bibliothequeRepository = {
  async listPretsEnCours({ eleveId }: ListPretsEnCoursQuery): Promise<Pret[]> {
    try {
      const where = eleveId
        ? { and: [{ eleve: { equals: eleveId } }, { dateRetourEffective: { equals: null } }] }
        : { dateRetourEffective: { equals: null } }

      const res = await httpClient.get<{ docs: PretDto[]; totalDocs: number }>('/prets', {
        params: {
          depth: 2,
          limit: 10,
          where: JSON.stringify(where),
        },
      })
      return res.data.docs.map(mapDtoToPret)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les prêts.'))
    }
  },

  /** Tous les prêts en cours (prof/admin/bénévole) — pour l'écran bibliothèque. */
  async listTousPretsEnCours(): Promise<Pret[]> {
    try {
      const res = await httpClient.get<{ docs: PretDto[]; totalDocs: number }>('/prets', {
        params: {
          depth: 2,
          limit: 0,
          sort: 'dateRetourPrevue',
          where: JSON.stringify({ dateRetourEffective: { equals: null } }),
        },
      })
      return res.data.docs.map(mapDtoToPret)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les prêts.'))
    }
  },

  /** Marquer un prêt comme retourné (date du jour). */
  async marquerRetourne(pretId: number): Promise<void> {
    try {
      await httpClient.patch(`/prets/${pretId}`, {
        dateRetourEffective: new Date().toISOString(),
      })
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de marquer le prêt comme retourné.'))
    }
  },

  /** Enregistrer un prêt : la validation (dispo, plafond 3) est côté hooks Payload. */
  async enregistrerPret(command: { eleveId: number; exemplaireId: number }): Promise<void> {
    try {
      await httpClient.post('/prets', {
        eleve: command.eleveId,
        exemplaire: command.exemplaireId,
      })
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, "Impossible d'enregistrer le prêt."))
    }
  },

  /** Catalogue : livres + exemplaires, avec statut dispo par exemplaire. */
  async listCatalogue(): Promise<LivreCatalogue[]> {
    try {
      const [livresRes, exemplairesRes, pretsRes] = await Promise.all([
        httpClient.get<{ docs: Livre[]; totalDocs: number }>('/livres', {
          params: {
            depth: 0,
            limit: 0,
            sort: 'titre',
            where: JSON.stringify({ archived: { not_equals: true } }),
          },
        }),
        httpClient.get<{ docs: Exemplaire[]; totalDocs: number }>('/exemplaires', {
          params: { depth: 0, limit: 0, sort: 'code' },
        }),
        httpClient.get<{ docs: PretDto[]; totalDocs: number }>('/prets', {
          params: {
            depth: 1,
            limit: 0,
            where: JSON.stringify({ dateRetourEffective: { equals: null } }),
          },
        }),
      ])

      const empruntes = codesEmpruntesDepuisPrets(pretsRes.data.docs)

      const exemplairesParLivre = new Map<number, Exemplaire[]>()
      for (const exemplaire of exemplairesRes.data.docs) {
        const livreId =
          typeof exemplaire.livre === 'object' ? exemplaire.livre.id : exemplaire.livre
        const liste = exemplairesParLivre.get(livreId) ?? []
        liste.push(exemplaire)
        exemplairesParLivre.set(livreId, liste)
      }

      return livresRes.data.docs.map((livre) => {
        const exemplaires = exemplairesParLivre.get(livre.id) ?? []
        return {
          id: livre.id,
          titre: livre.titre,
          auteur: livre.auteur ?? null,
          isbn: livre.isbn ?? null,
          resume: livre.resume ?? null,
          editeur: livre.editeur ?? null,
          niveau: livre.niveau ?? null,
          categorie: livre.categorie ?? null,
          archived: livre.archived ?? false,
          createdAt: livre.createdAt,
          exemplaires: exemplaires.map((ex) => ({
            id: ex.id,
            code: ex.code ?? '',
            etat: ex.etat ?? 'neuf',
            disponible: !empruntes.has(ex.code ?? ''),
          })),
        }
      })
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger le catalogue.'))
    }
  },

  /** Créer un livre au catalogue. */
  async creerLivre(command: {
    titre: string
    auteur?: string
    niveau?: string
    categorie?: string
    resume?: string
  }): Promise<number> {
    try {
      const res = await httpClient.post<Livre>('/livres', command)
      return res.data.id
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de créer le livre.'))
    }
  },

  /** Modifier les métadonnées d'un livre (admin/bénévole — biblioWrite côté API). */
  async modifierLivre(command: {
    id: number
    titre: string
    auteur?: string
    isbn?: string
    niveau?: string
    categorie?: string
    editeur?: string
    resume?: string
  }): Promise<void> {
    try {
      const { id, ...champs } = command
      await httpClient.patch(`/livres/${id}`, champs)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de modifier le livre.'))
    }
  },

  /**
   * Historique des emprunts d'un livre : tous les prêts dont un exemplaire
   * appartient au livre. Filtrage client : le where relationnel imbriqué
   * (exemplaire.livre) n'est pas supporté par l'adapter PG (Spec 02 §8).
   */
  async listPretsParLivre(livreId: number): Promise<Pret[]> {
    try {
      const res = await httpClient.get<{ docs: PretDto[]; totalDocs: number }>('/prets', {
        params: {
          depth: 2,
          limit: 0,
          sort: '-createdAt',
        },
      })
      return res.data.docs
        .filter((pret) => {
          const exemplaire = typeof pret.exemplaire === 'object' ? pret.exemplaire : null
          const livre =
            exemplaire && typeof exemplaire.livre === 'object' ? exemplaire.livre : null
          return livre?.id === livreId
        })
        .map(mapDtoToPret)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les emprunts.'))
    }
  },
}

export const _internals = { mapDtoToPret, codesEmpruntesDepuisPrets }
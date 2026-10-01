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

  /**
   * Marquer un prêt comme retourné (date du jour). Action sensible :
   * passe par la route dédiée qui revérifie le mot de passe de la session
   * côté serveur (le PATCH REST direct ne ferait que le contrôle de rôle).
   */
  async marquerRetourne(command: { motDePasse: string; pretId: number }): Promise<void> {
    try {
      await httpClient.post(`/bibliotheque/prets/${command.pretId}/retour`, {
        motDePasse: command.motDePasse,
      })
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de marquer le prêt comme retourné.'))
    }
  },

  /**
   * Enregistrer un prêt. Action sensible : passe par la route dédiée qui
   * revérifie le mot de passe de la session côté serveur ; la validation
   * métier (dispo, plafond 3) reste côté hooks Payload.
   */
  async enregistrerPret(command: {
    eleveId: number
    exemplaireId: number
    motDePasse: string
    /** Optionnel : fixée par l'assistant, sinon les hooks serveur la calculent. */
    dateRetourPrevue?: string
  }): Promise<void> {
    try {
      await httpClient.post('/bibliotheque/prets', {
        eleveId: command.eleveId,
        exemplaireId: command.exemplaireId,
        motDePasse: command.motDePasse,
        ...(command.dateRetourPrevue ? { dateRetourPrevue: command.dateRetourPrevue } : {}),
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

  /** Créer un livre au catalogue (isbn persisté, optionnel). */
  async creerLivre(command: {
    titre: string
    auteur?: string
    isbn?: string
    niveau?: string
    categorie?: string
    resume?: string
  }): Promise<number> {
    try {
      // REST Payload : la création répond { doc, message } (et non le document
      // aplati) — l'id du livre créé vit dans res.data.doc.id. Lu à plat, il
      // valait undefined et les exemplaires partaient avec une référence vide
      // (« The following field is invalid: Livre »).
      const res = await httpClient.post<{ doc: Livre }>('/livres', command)
      const id = res.data.doc?.id
      if (typeof id !== 'number') {
        throw new Error("La création du livre n'a pas renvoyé son identifiant.")
      }
      return id
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de créer le livre.'))
    }
  },

  /**
   * Créer un exemplaire d'un livre (code auto-généré côté Payload quand
   * absent — ex. LPV-0001).
   */
  async creerExemplaire(command: { livre: number; code?: string }): Promise<void> {
    try {
      await httpClient.post('/exemplaires', command)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, "Impossible de créer l'exemplaire."))
    }
  },

  /**
   * Supprimer physiquement un exemplaire. À réserver aux exemplaires sans
   * historique de prêt : la clé étrangère (prets → exemplaires, sans action
   * en cascade) rejette toute suppression d'un exemplaire déjà emprunté,
   * même retourné depuis.
   */
  async supprimerExemplaire(command: { id: number }): Promise<void> {
    try {
      await httpClient.delete(`/exemplaires/${command.id}`)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, "Impossible de retirer l'exemplaire."))
    }
  },

  /**
   * Retirer un livre du catalogue (archivage). La suppression physique est
   * impossible dès qu'un exemplaire existe (clé étrangère exemplaires →
   * livres) ; l'archivage conserve l'historique des prêts et les prêts en
   * cours, et masque le livre du catalogue du portail (déjà filtré sur
   * archived not_equals true).
   */
  async retirerCatalogue(command: { id: number }): Promise<void> {
    try {
      await httpClient.patch(`/livres/${command.id}`, { archived: true })
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de retirer le livre du catalogue.'))
    }
  },

  /** Modifier les métadonnées d'un livre (admin/bénévole — biblioWrite côté API). */
  async modifierLivre(command: {
    id: number
    titre: string
    auteur?: string | null
    isbn?: string | null
    niveau?: string | null
    categorie?: string | null
    editeur?: string | null
    resume?: string | null
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
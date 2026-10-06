import { ajouterJoursCalendaires, dateParis, FUSEAU_COURS, isoVersJour } from '@/shared/fuseau'

export const ENTETE_EXPORT_PRESENCES = ['Date', 'Heure', 'Durée (min)', 'Matière', 'Prof', 'Élève', 'Statut']

const MATIERES: Record<string, string> = { anglais: 'Anglais', autre: 'Autre', francais: 'Français', maths: 'Maths' }
const STATUTS: Record<string, string> = {
  'absent': 'Absent',
  'absent-justifie': 'Absent (justifié)',
  'present': 'Présent',
}

type Personne = { prenom?: null | string; nom?: null | string } | null | number | undefined
type PresenceExport = {
  present?: null | string
  eleve?: Personne
  seance?: { date?: null | string; duree?: null | number; matiere?: null | string; prof?: Personne } | null | number
}

const nomComplet = (personne: Personne): string =>
  typeof personne === 'object' && personne !== null ? [personne.prenom, personne.nom].filter(Boolean).join(' ') : ''

const formatJour = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', timeZone: FUSEAU_COURS, year: 'numeric' })
const formatHeure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: FUSEAU_COURS })

// Présences (séance et élève peuplés) → lignes CSV, en-tête comprise, triées
// par date de séance puis par élève. Dates et heures en heure de Paris.
export function lignesExportPresences(presences: PresenceExport[]): string[][] {
  const lignes = presences
    .map((presence) => {
      const seance = typeof presence.seance === 'object' && presence.seance !== null ? presence.seance : null
      const date = seance?.date ? new Date(seance.date) : null
      return {
        date,
        ligne: [
          date ? formatJour.format(date) : '',
          date ? formatHeure.format(date) : '',
          seance?.duree ? String(seance.duree) : '',
          MATIERES[seance?.matiere ?? ''] ?? seance?.matiere ?? '',
          nomComplet(seance?.prof),
          nomComplet(presence.eleve),
          STATUTS[presence.present ?? ''] ?? presence.present ?? '',
        ],
      }
    })
    .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0) || a.ligne[5].localeCompare(b.ligne[5], 'fr'))
    .map(({ ligne }) => ligne)
  return [ENTETE_EXPORT_PRESENCES, ...lignes]
}

export type ParametresExport =
  | { ok: true; depuis: Date | null; avant: Date | null; eleveId: number | null }
  | { ok: false; message: string }

const FORMAT_JOUR = /^\d{4}-\d{2}-\d{2}$/

// Paramètres d'URL (?debut=AAAA-MM-JJ&fin=AAAA-MM-JJ&eleve=ID), tous
// facultatifs : jours entiers à Paris, fin incluse (borne exclusive au
// lendemain minuit)
export function lireParametresExport(params: URLSearchParams): ParametresExport {
  const debut = params.get('debut') || null
  const fin = params.get('fin') || null
  const eleve = params.get('eleve') || null
  if ((debut && !FORMAT_JOUR.test(debut)) || (fin && !FORMAT_JOUR.test(fin))) {
    return { message: 'Dates attendues au format AAAA-MM-JJ.', ok: false }
  }
  if (debut && fin && fin < debut) {
    return { message: 'La date de fin doit suivre la date de début.', ok: false }
  }
  const eleveId = eleve ? Number(eleve) : null
  if (eleveId !== null && (!Number.isInteger(eleveId) || eleveId <= 0)) {
    return { message: 'Élève inconnu.', ok: false }
  }
  return {
    avant: fin ? dateParis(ajouterJoursCalendaires(isoVersJour(fin), 1), '00:00') : null,
    depuis: debut ? dateParis(isoVersJour(debut), '00:00') : null,
    eleveId,
    ok: true,
  }
}

const jourLocal = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

// Période proposée par défaut : du 1er septembre de l'année scolaire en
// cours jusqu'à aujourd'hui
export function periodeAnneeScolaire(aujourdhui = new Date()): { debut: string; fin: string } {
  const annee = aujourdhui.getMonth() >= 8 ? aujourdhui.getFullYear() : aujourdhui.getFullYear() - 1
  return { debut: `${annee}-09-01`, fin: jourLocal(aujourdhui) }
}

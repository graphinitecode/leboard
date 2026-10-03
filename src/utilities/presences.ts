// Ordres de tri de l'historique des présences — entêtes cliquables de la
// fiche (paramètre `tri` dans l'URL), défaut : récent d'abord.
export type OrdrePresences = 'date-asc' | 'date-desc' | 'matiere' | 'statut'
export const ORDRES_PRESENCES: OrdrePresences[] = ['date-asc', 'date-desc', 'matiere', 'statut']

/** Valeur sûre (`?tri=…` inconnu → défaut) : le récent d'abord. */
export function ordrePresences(valeur: null | string | undefined): OrdrePresences {
  return (ORDRES_PRESENCES.find((ordre) => ordre === valeur) ?? 'date-desc') as OrdrePresences
}

type PresenceAvecSeance = {
  present?: null | string
  seance?: unknown
}

const collateur = new Intl.Collator('fr', { sensitivity: 'base' })

// Les lignes Présences n'ont pas de date propre : elles pointent la séance,
// qui porte la date utile — la date de création de la ligne peut diverger
// (absence saisie après coup, séance créée tardivement…), d'où un historique
// affiché en désordre si l'on trie sur createdAt.
const horodatageSeance = (presence: unknown): number => {
  const date = (presence as { seance?: { date?: unknown } | null }).seance?.date
  if (date instanceof Date) return date.getTime()
  // Depth 1 renvoie l'ISO en string ; String() tolère le Date objet (API locale).
  const horodatage = Date.parse(String(date ?? ''))
  return Number.isNaN(horodatage) ? -Infinity : horodatage
}

const matiereDe = (presence: unknown): string =>
  String((presence as { seance?: { matiere?: unknown } | null }).seance?.matiere ?? '')

/** Tri par ordre voulu ; sans ordre : date de séance, récent en premier. */
export function trierPresences<T extends PresenceAvecSeance>(
  presences: T[],
  ordre: OrdrePresences = 'date-desc',
): T[] {
  const parDateDecroissante = (a: T, b: T): number => horodatageSeance(b) - horodatageSeance(a)
  const docs = [...presences]

  switch (ordre) {
    case 'date-asc':
      return docs.sort((a, b) => horodatageSeance(a) - horodatageSeance(b))
    case 'matiere':
      return docs.sort(
        (a, b) => collateur.compare(matiereDe(a), matiereDe(b)) || parDateDecroissante(a, b),
      )
    case 'statut':
      return docs.sort(
        // Alphabétique sur la valeur brute : absent, absent-justifié puis
        // présent — les absences se regroupent en tête.
        (a, b) =>
          collateur.compare(String((a as PresenceAvecSeance).present ?? ''), String((b as PresenceAvecSeance).present ?? '')) ||
          parDateDecroissante(a, b),
      )
    default:
      return docs.sort(parDateDecroissante)
  }
}
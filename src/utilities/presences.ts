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
// --- Pagination de l'historique (lots de 10) -------------------------------

/** Nombre de lignes de présence par page dans la fiche. */
export const PRESENCES_PAR_PAGE = 10

/**
 * Découpe une liste (déjà triée) en lot paginé — la fiche élève charge tout
 * l'historique puis l'affiche par tranches : les entêtes cliquables de tri
 * gardent leur logique en mémoire (matière, statut), inutile de doubler le
 * tri côté requête.
 */
export function paginerParPage<T>(
  valeurs: T[],
  page: number,
  taille = PRESENCES_PAR_PAGE,
): { lignes: T[]; page: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(valeurs.length / taille))
  const pageSûre = Math.min(Math.max(1, Math.floor(Number.isFinite(page) ? page : 1)), totalPages)
  const debut = (pageSûre - 1) * taille
  return {
    lignes: valeurs.slice(debut, debut + taille),
    page: pageSûre,
    totalPages,
  }
}

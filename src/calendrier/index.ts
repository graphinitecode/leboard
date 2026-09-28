export type {
  BandeDispo,
  BrouillonSeance,
  CategorieMarqueurCalendrier,
  CibleCreneau,
  EventCalendrier,
  FormeMarqueur,
  MatiereCalendrier,
  MarqueurJourCalendrier,
  PlageSelectionnee,
  VueCalendrier,
  DragPayload,
} from './domain/calendrier.entity'
export type {
  CreerSeanceCommand,
  DeplacerSeanceCommand,
  SeancesPeriodeQuery,
} from './domain/interfaces/calendrier-repository.interface'
export {
  HEURE_DEBUT_GRILLE,
  HEURE_FIN_GRILLE,
  MINUTES_CRENEAU,
  DUREE_DEFAUT,
  JOURS_GRILLE,
  debutSemaine,
  ajouterSemaines,
  ajouterJours,
  bornesSemaine,
  indexJourGrille,
  filtrerSemaine,
  positionMinutes,
  dureeBornee,
  arrondirAuCreneau,
  cibleDepuisCases,
  seChevauchent,
  chevaucheUne,
  dateCiblee,
  bandeEnMinutes,
  labelSemaine,
  rangeesGrille,
  couleurMatiere,
  matiereFiable,
  joursGrille,
  rangeeDepuisHeure,
  heureDepuisRangee,
  plageDepuisCases,
  brouillonDepuisPlage,
  dureePlage,
  seancesDuJourTriees,
  joursAvecSeances,
} from './domain/calendrier.utils'
export { calendrierRepository } from './infrastructure/calendrier.repository'
export { calendrierHandlers } from './application/calendrier.handlers'
export {
  CALENDRIER_QUERY_KEY,
  useSeancesPeriode,
  useElevesDuProf,
  useCreerSeance,
  useDeplacerSeance,
} from './application/calendrier.hooks'
export { WeekCalendar } from '@/components/organisms/o-week-calendar'
export type { WeekCalendarMode, WeekCalendarEvent } from '@/components/organisms/o-week-calendar'
export { MonthPicker } from '@/components/organisms/o-month-picker'
export { MonthCalendarCard, CATEGORIES_DEFAUT } from '@/components/molecules/m-month-calendar'
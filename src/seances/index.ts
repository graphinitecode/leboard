import type {
  Seance,
  SeanceDetail,
  StatutPresence,
} from './domain/seance.entity'
import type { ISeancesRepository } from './domain/interfaces/seances-repository.interface'
import { listMySeancesHandler } from './application/queries/list-my-seances/list-my-seances.handler'
import { getSeanceHandler } from './application/queries/get-seance/get-seance.handler'
import { togglePresenceHandler } from './application/commands/toggle-presence/toggle-presence.handler'
import { enregistrerRetourHandler } from './application/commands/enregistrer-retour/enregistrer-retour.handler'
import {
  useListMySeances,
  useGetSeance,
  useTogglePresence,
  useEnregistrerRetour,
  SEANCES_QUERY_KEY,
  SEANCE_QUERY_KEY,
} from './application/seances.hooks'
import { seancesRepository } from './infrastructure/seances.repository'
import type { SeanceLigneViewModel, SeanceDetailViewModel } from './presentation/seance.presenter'
import { presentSeanceLigne, presentSeanceDetail, statutPresenceLabel } from './presentation/seance.presenter'
import { useSeancesStore } from './presentation/store/seances.store'
import { TogglePresence } from '@/components/organisms/o-presence-toggle'
import { FormRetour } from '@/components/organisms/o-return-form'

export type {
  Seance,
  SeanceDetail,
  StatutPresence,
  ISeancesRepository,
  SeanceLigneViewModel,
  SeanceDetailViewModel,
}
export {
  listMySeancesHandler,
  getSeanceHandler,
  togglePresenceHandler,
  enregistrerRetourHandler,
  useListMySeances,
  useGetSeance,
  useTogglePresence,
  useEnregistrerRetour,
  SEANCES_QUERY_KEY,
  SEANCE_QUERY_KEY,
  seancesRepository,
  presentSeanceLigne,
  presentSeanceDetail,
  statutPresenceLabel,
  useSeancesStore,
  TogglePresence,
  FormRetour,
}
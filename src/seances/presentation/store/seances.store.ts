import { create } from 'zustand'

import type { SeanceLigneViewModel } from '../seance.presenter'

interface SeancesState {
  seances: SeanceLigneViewModel[]
  setSeances: (seances: SeanceLigneViewModel[]) => void
  reset: () => void
}

export const useSeancesStore = create<SeancesState>((set) => ({
  seances: [],
  setSeances: (seances) => set({ seances }),
  reset: () => set({ seances: [] }),
}))
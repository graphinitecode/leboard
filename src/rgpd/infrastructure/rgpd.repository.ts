import type { PolitiqueRgpd as PolitiqueDto } from '@/payload-types'
import type { PolitiqueRgpd } from '@/rgpd/domain/politique.entity'
import { getAxiosErrorMessage } from '@/shared/infrastructure/axios-error'
import { httpClient } from '@/shared/infrastructure/http.client'

export const rgpdRepository = {
  async getPolitique(): Promise<PolitiqueRgpd | null> {
    try {
      const res = await httpClient.get<PolitiqueDto>('/globals/politique-rgpd')
      return {
        contenu: res.data.contenu,
        version: res.data.version ?? null,
        publieeLe: res.data.datePublication ?? null,
      }
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger la politique RGPD.'))
    }
  },
}
import type { PolitiqueRgpd } from './domain/politique.entity'
import { getPolitiqueHandler } from './application/queries/get-politique/get-politique.handler'
import { useGetPolitique, POLITIQUE_QUERY_KEY } from './application/rgpd.hooks'
import { rgpdRepository } from './infrastructure/rgpd.repository'

export type { PolitiqueRgpd }
export { getPolitiqueHandler, useGetPolitique, POLITIQUE_QUERY_KEY, rgpdRepository }
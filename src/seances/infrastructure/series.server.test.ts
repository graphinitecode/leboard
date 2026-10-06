import type { Payload } from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Seance, Series as Serie } from '@/payload-types'

import {
  ErreurSerie,
  genererOccurrencesSerie,
  modifierSeanceSerie,
  prolongerSeries,
  supprimerSeanceSerie,
} from './series.server'

type Doc = Record<string, unknown> & { id: number }

// Fausse instance Payload : collections en mémoire, filtres réduits à ceux
// qu'utilise le service (égalité, >=, in)
function fauxPayload(initial: { seances?: Doc[]; series?: Doc[] } = {}) {
  const tables: Record<string, Doc[]> = {
    presences: [],
    seances: [...(initial.seances ?? [])],
    series: [...(initial.series ?? [])],
  }
  let prochainId = 1000

  const correspond = (doc: Doc, where?: Record<string, unknown>): boolean => {
    if (!where) return true
    if (Array.isArray(where.and)) return where.and.every((w) => correspond(doc, w as Record<string, unknown>))
    return Object.entries(where).every(([champ, condition]) => {
      const c = condition as Record<string, unknown>
      const valeur = doc[champ]
      if ('equals' in c) return valeur === c.equals
      if ('greater_than_equal' in c) return String(valeur) >= String(c.greater_than_equal)
      if ('in' in c) return (c.in as unknown[]).includes(valeur)
      return true
    })
  }

  const payload = {
    create: vi.fn(async ({ collection, data }: { collection: string; data: Doc }) => {
      const doc = { ...data, id: prochainId++ }
      tables[collection].push(doc)
      return doc
    }),
    delete: vi.fn(async ({ collection, id, where }: { collection: string; id?: number; where?: Record<string, unknown> }) => {
      tables[collection] = tables[collection].filter((d) => (id !== undefined ? d.id !== id : !correspond(d, where)))
    }),
    find: vi.fn(async ({ collection, where }: { collection: string; where?: Record<string, unknown> }) => ({
      docs: tables[collection].filter((d) => correspond(d, where)),
    })),
    findByID: vi.fn(async ({ collection, id }: { collection: string; id: number }) =>
      tables[collection].find((d) => d.id === id),
    ),
    update: vi.fn(async ({ collection, data, id }: { collection: string; data: Doc; id: number }) => {
      const doc = tables[collection].find((d) => d.id === id) as Doc
      Object.assign(doc, data)
      return doc
    }),
  }
  return { payload: payload as unknown as Payload, tables }
}

const SERIE: Doc = {
  duree: 60,
  fin: null,
  frequence: 'hebdomadaire',
  genereJusqua: null,
  groupe: [11, 12],
  heureDebut: '14:00',
  id: 1,
  matiere: 'maths',
  premiere: '2026-10-06',
  prof: 5,
}

describe('génération des occurrences', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-10-06T08:00:00Z'), toFake: ['Date'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("crée une séance par occurrence, à l'heure de Paris, et avance genereJusqua", async () => {
    const { payload, tables } = fauxPayload({ series: [{ ...SERIE }] })
    const creees = await genererOccurrencesSerie({ jusqua: '2026-10-31', payload, serie: SERIE as unknown as Serie })

    expect(creees).toBe(4)
    expect(tables.seances.map((s) => s.date)).toEqual([
      '2026-10-06T12:00:00.000Z',
      '2026-10-13T12:00:00.000Z',
      '2026-10-20T12:00:00.000Z',
      // Heure d'hiver : 14h à Paris = 13h UTC
      '2026-10-27T13:00:00.000Z',
    ])
    expect(tables.seances[0]).toMatchObject({ duree: 60, groupe: [11, 12], matiere: 'maths', prof: 5, serie: 1 })
    expect(tables.series[0].genereJusqua).toBe('2026-10-31')
  })

  it("le cron prolonge l'horizon glissant sans recréer l'existant", async () => {
    const { payload, tables } = fauxPayload({ series: [{ ...SERIE, genereJusqua: '2026-12-31' }] })
    const creees = await prolongerSeries(payload)
    // Horizon : 6 janvier 2027 → mardi 5 janvier seulement
    expect(creees).toBe(1)
    expect(tables.seances.map((s) => s.date)).toEqual(['2027-01-05T13:00:00.000Z'])

    expect(await prolongerSeries(payload)).toBe(0)
  })

  it('le cron ignore une série terminée', async () => {
    const { payload } = fauxPayload({ series: [{ ...SERIE, fin: '2026-10-20', genereJusqua: '2026-10-20' }] })
    expect(await prolongerSeries(payload)).toBe(0)
  })
})

describe('modification selon la portée', () => {
  const seances = (): Doc[] => [
    { date: '2026-10-13T12:00:00.000Z', duree: 60, id: 21, serie: 1 },
    { date: '2026-10-20T12:00:00.000Z', duree: 60, id: 22, serie: 1 },
    { date: '2026-10-27T13:00:00.000Z', duree: 60, id: 23, serie: 1 },
  ]

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-10-10T08:00:00Z'), toFake: ['Date'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('« cette séance » ne touche ni les autres ni la règle', async () => {
    const { payload, tables } = fauxPayload({ seances: seances(), series: [{ ...SERIE, genereJusqua: '2026-10-31' }] })
    const seance = tables.seances[1] as unknown as Seance
    await modifierSeanceSerie({ date: new Date('2026-10-21T13:00:00.000Z'), duree: 60, payload, portee: 'une', seance })

    expect(tables.seances.map((s) => s.date)).toEqual([
      '2026-10-13T12:00:00.000Z',
      '2026-10-21T13:00:00.000Z',
      '2026-10-27T13:00:00.000Z',
    ])
    expect(tables.series[0]).toMatchObject({ heureDebut: '14:00', premiere: '2026-10-06' })
  })

  it('« celle-ci et les suivantes » décale les suivantes et la règle (mercredi 15h)', async () => {
    const { payload, tables } = fauxPayload({ seances: seances(), series: [{ ...SERIE, genereJusqua: '2026-10-31' }] })
    const seance = tables.seances[1] as unknown as Seance
    // mardi 20 14h → mercredi 21 15h, durée 90
    await modifierSeanceSerie({ date: new Date('2026-10-21T13:00:00.000Z'), duree: 90, payload, portee: 'suivantes', seance })

    expect(tables.seances.map((s) => [s.date, s.duree])).toEqual([
      ['2026-10-13T12:00:00.000Z', 60],
      ['2026-10-21T13:00:00.000Z', 90],
      // Heure d'hiver : mercredi 28 15h à Paris = 14h UTC
      ['2026-10-28T14:00:00.000Z', 90],
    ])
    expect(tables.series[0]).toMatchObject({
      duree: 90,
      genereJusqua: '2026-11-01',
      heureDebut: '15:00',
      premiere: '2026-10-07',
    })
  })

  it('« toute la série » épargne les séances passées', async () => {
    vi.setSystemTime(new Date('2026-10-15T08:00:00Z'))
    const { payload, tables } = fauxPayload({ seances: seances(), series: [{ ...SERIE }] })
    const seance = tables.seances[2] as unknown as Seance
    await modifierSeanceSerie({ date: new Date('2026-10-27T14:00:00.000Z'), duree: 60, payload, portee: 'toutes', seance })

    expect(tables.seances.map((s) => s.date)).toEqual([
      '2026-10-13T12:00:00.000Z',
      '2026-10-20T13:00:00.000Z',
      '2026-10-27T14:00:00.000Z',
    ])
  })

  it('refuse un décalage qui ferait finir une séance après 18h', async () => {
    const { payload, tables } = fauxPayload({ seances: seances(), series: [{ ...SERIE }] })
    const seance = tables.seances[0] as unknown as Seance
    await expect(
      modifierSeanceSerie({ date: new Date('2026-10-13T15:30:00.000Z'), duree: 60, payload, portee: 'suivantes', seance }),
    ).rejects.toBeInstanceOf(ErreurSerie)
    expect(tables.seances[0].date).toBe('2026-10-13T12:00:00.000Z')
  })
})

describe('suppression selon la portée', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-10-15T08:00:00Z'), toFake: ['Date'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const seances = (): Doc[] => [
    { date: '2026-10-13T12:00:00.000Z', id: 21, serie: 1 },
    { date: '2026-10-20T12:00:00.000Z', id: 22, serie: 1 },
    { date: '2026-10-27T13:00:00.000Z', id: 23, serie: 1 },
  ]

  it('« celle-ci et les suivantes » supprime et arrête la série la veille', async () => {
    const { payload, tables } = fauxPayload({ seances: seances(), series: [{ ...SERIE }] })
    tables.presences.push({ id: 90, seance: 22 }, { id: 91, seance: 21 })
    await supprimerSeanceSerie({ payload, portee: 'suivantes', seance: tables.seances[1] as unknown as Seance })

    expect(tables.seances.map((s) => s.id)).toEqual([21])
    expect(tables.presences.map((p) => p.id)).toEqual([91])
    expect(tables.series[0].fin).toBe('2026-10-19')
  })

  it('« toute la série » garde le passé et arrête la série hier', async () => {
    const { payload, tables } = fauxPayload({ seances: seances(), series: [{ ...SERIE }] })
    await supprimerSeanceSerie({ payload, portee: 'toutes', seance: tables.seances[2] as unknown as Seance })

    expect(tables.seances.map((s) => s.id)).toEqual([21])
    expect(tables.series[0].fin).toBe('2026-10-14')
  })

  it("supprime la série elle-même quand elle n'avait pas commencé", async () => {
    const { payload, tables } = fauxPayload({
      seances: [{ date: '2026-10-20T12:00:00.000Z', id: 22, serie: 1 }],
      series: [{ ...SERIE, premiere: '2026-10-20' }],
    })
    await supprimerSeanceSerie({ payload, portee: 'toutes', seance: tables.seances[0] as unknown as Seance })
    expect(tables.series).toEqual([])
  })
})

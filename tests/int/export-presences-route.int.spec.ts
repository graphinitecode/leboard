import { beforeEach, describe, expect, it, vi } from 'vitest'

const utilisateur = { current: null as null | { id: number; role: string } }
const find = vi.fn()

vi.mock('@/utilities/profAuth', () => ({ getMeUserServer: async () => utilisateur.current }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))

import { GET } from '@/app/(frontend)/profs/export/presences/route'

const requete = (query: string) => new Request(`http://localhost/profs/export/presences${query}`)

describe('GET /profs/export/presences', () => {
  beforeEach(() => {
    find.mockReset().mockResolvedValue({
      docs: [
        {
          eleve: { nom: 'Martin', prenom: 'Lucas' },
          present: 'present',
          seance: { date: '2026-10-20T12:00:00.000Z', duree: 60, matiere: 'maths', prof: { nom: 'Curie', prenom: 'Marie' } },
        },
      ],
    })
    utilisateur.current = { id: 5, role: 'prof' }
  })

  it('refuse les parents et les visiteurs', async () => {
    utilisateur.current = { id: 9, role: 'parent' }
    expect((await GET(requete(''))).status).toBe(403)
    utilisateur.current = null
    expect((await GET(requete(''))).status).toBe(403)
    expect(find).not.toHaveBeenCalled()
  })

  it('refuse des paramètres invalides', async () => {
    const reponse = await GET(requete('?debut=2026-10-31&fin=2026-09-01'))
    expect(reponse.status).toBe(400)
    expect(await reponse.text()).toBe('La date de fin doit suivre la date de début.')
  })

  it("renvoie un fichier CSV, avec les règles d'accès de l'utilisateur et la période demandée", async () => {
    const reponse = await GET(requete('?debut=2026-09-01&fin=2026-10-31&eleve=7'))

    expect(reponse.status).toBe(200)
    expect(reponse.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(reponse.headers.get('Content-Disposition')).toMatch(/^attachment; filename="presences-eleve-7-\d{4}-\d{2}-\d{2}\.csv"$/)
    expect(await reponse.text()).toContain('20/10/2026;14:00;60;Maths;Marie Curie;Lucas Martin;Présent')

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'presences',
        overrideAccess: false,
        user: utilisateur.current,
        where: {
          and: [
            { eleve: { equals: 7 } },
            { 'seance.date': { greater_than_equal: '2026-08-31T22:00:00.000Z' } },
            { 'seance.date': { less_than: '2026-10-31T23:00:00.000Z' } },
          ],
        },
      }),
    )
  })
})

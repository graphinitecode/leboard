import { describe, expect, it, vi } from 'vitest'

import { inviterNouveauParent } from './inviterNouveauParent'

const creerLogger = () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() })

const creerReq = (forgotOk = true) => ({
  payload: {
    forgotPassword: vi.fn(forgotOk ? async () => ({}) : async () => {
      throw new Error('pas d adapter email')
    }),
    logger: creerLogger(),
  },
})

describe('inviterNouveauParent', () => {
  it('declenche forgotPassword a la creation d un parent', async () => {
    const req = creerReq()
    const doc = { id: 7, email: 'parent@lpv.fr', role: 'parent' }

    await inviterNouveauParent({ doc, operation: 'create', req } as never)

    expect(req.payload.forgotPassword).toHaveBeenCalledWith({
      collection: 'users',
      data: { email: 'parent@lpv.fr' },
    })
    expect(req.payload.logger.info).toHaveBeenCalled()
  })

  it('log un avertissement si l adapter email echoue', async () => {
    const req = creerReq(false)

    await inviterNouveauParent({ doc: { id: 7, email: 'p@lpv.fr', role: 'parent' }, operation: 'create', req } as never)

    expect(req.payload.logger.warn).toHaveBeenCalled()
  })

  it('ne fait rien pour un non-parent', async () => {
    const req = creerReq()

    await inviterNouveauParent({ doc: { id: 7, email: 'prof@lpv.fr', role: 'prof' }, operation: 'create', req } as never)

    expect(req.payload.forgotPassword).not.toHaveBeenCalled()
  })

  it('ne fait rien hors creation', async () => {
    const req = creerReq()

    await inviterNouveauParent({ doc: { id: 7, email: 'p@lpv.fr', role: 'parent' }, operation: 'update', req } as never)

    expect(req.payload.forgotPassword).not.toHaveBeenCalled()
  })
})
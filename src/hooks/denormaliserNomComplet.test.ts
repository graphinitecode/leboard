import type { CollectionBeforeChangeHook } from 'payload'
import { describe, expect, it } from 'vitest'

import { denormaliserNomComplet } from './denormaliserNomComplet'

const appeler = (data: Record<string, unknown> | null) =>
  denormaliserNomComplet({ data } as unknown as Parameters<CollectionBeforeChangeHook>[0])

describe('denormaliserNomComplet', () => {
  it('derive le nom complet a partir de prenom et nom', () => {
    const result = appeler({ prenom: 'Marie', nom: 'Dupont' })

    expect(result?.name).toBe('Marie Dupont')
  })

  it('ignore les espaces superflus', () => {
    const result = appeler({ prenom: '  Marie ', nom: '  Dupont  ' })

    expect(result?.name).toBe('Marie Dupont')
  })

  it('gere le nom compose', () => {
    const result = appeler({ prenom: 'Léa', nom: 'Van Der Berg' })

    expect(result?.name).toBe('Léa Van Der Berg')
  })

  it('conserve name si prenom et nom absents', () => {
    const result = appeler({ name: 'Ancien Nom' })

    expect(result?.name).toBe('Ancien Nom')
  })

  it('ne casse pas si data est null', () => {
    expect(appeler(null)).toBeNull()
  })
})
import { describe, expect, it } from 'vitest'

import { getAxiosErrorMessage } from '@/shared/infrastructure/axios-error'

const erreurAxios = (status: number, body: unknown) => {
  const err = new Error('Request failed') as Error & {
    isAxiosError: boolean
    response: { status: number; data: unknown }
  }
  err.isAxiosError = true
  err.response = { status, data: body }
  return err
}

describe('getAxiosErrorMessage', () => {
  it('extrait le message de la forme Payload { errors: [{ message }] }', () => {
    const err = erreurAxios(401, {
      errors: [{ message: 'The email or password provided is incorrect.' }],
    })
    expect(getAxiosErrorMessage(err, 'Email ou mot de passe incorrect.')).toBe(
      'The email or password provided is incorrect.',
    )
  })

  it('extrait le message de la forme { message }', () => {
    expect(getAxiosErrorMessage(erreurAxios(400, { message: 'boom' }))).toBe('boom')
  })

  it('retombe sur le libelle par statut quand aucune forme connue ne matche', () => {
    expect(getAxiosErrorMessage(erreurAxios(401, {}))).toBe('Non autorisé.')
    expect(getAxiosErrorMessage(erreurAxios(403, {}))).toBe('Accès refusé.')
    expect(getAxiosErrorMessage(erreurAxios(404, {}))).toBe('Ressource introuvable.')
  })

  it('retourne le fallback hors axios', () => {
    expect(getAxiosErrorMessage('nimporte quoi', 'Fallback.')).toBe('Fallback.')
  })
})
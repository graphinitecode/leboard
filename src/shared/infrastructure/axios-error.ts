import { isAxiosError as isAxiosErrorGuard } from 'axios'

export const getAxiosErrorMessage = (err: unknown, fallback = 'Une erreur est survenue.'): string => {
  if (isAxiosErrorGuard(err)) {
    const data = err.response?.data as {
      message?: unknown
      errors?: unknown
      error?: unknown
    } | undefined

    if (typeof data?.message === 'string' && data.message) return data.message
    if (typeof data?.error === 'string' && data.error) return data.error
    // Forme Payload REST : { errors: [{ message: '…' }] }
    if (Array.isArray(data?.errors)) {
      const first = data.errors[0] as { message?: unknown } | undefined
      if (first && typeof first.message === 'string' && first.message) return first.message
    }
    if (data?.errors && typeof data.errors === 'object') {
      const first = Object.values(data.errors)[0]
      if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
      if (typeof first === 'string') return first
    }
    if (err.response?.status === 401) return 'Non autorisé.'
    if (err.response?.status === 403) return 'Accès refusé.'
    if (err.response?.status === 404) return 'Ressource introuvable.'
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export const isAxiosUnauthorized = (err: unknown): boolean =>
  isAxiosErrorGuard(err) && err.response?.status === 401

export { isAxiosErrorGuard as isAxiosError }
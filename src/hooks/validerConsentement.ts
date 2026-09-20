import type { CollectionBeforeValidateHook } from 'payload'

import { estMajeur } from '../utilities/rgpd'

export const validerConsentement: CollectionBeforeValidateHook = async ({ data, operation }) => {
  if (operation !== 'create') return data
  if (!data) return data

  const majeur = estMajeur(data.dateNaissance)

  if (majeur) {
    // Un majeur consent lui-même : pas de parent requis
    if (!data.consentementRGPD) {
      throw new Error(
        "Le consentement de l'élève (majeur) est obligatoire pour créer ce profil.",
      )
    }
    return data
  }

  if (!data.consentementRGPD) {
    throw new Error(
      'Le consentement parental est obligatoire pour créer un profil d’élève mineur.',
    )
  }

  if (!data.parents?.length) {
    throw new Error(
      'Un élève mineur doit avoir au moins un parent relié (destinataire du consentement).',
    )
  }

  return data
}
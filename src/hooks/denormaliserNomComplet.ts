import type { CollectionBeforeChangeHook } from 'payload'

// Dérive le nom complet (name) à partir de prenom + nom.
// `name` est conservé pour les affichages existants (headers, dashboards)
// mais n'est plus éditable : source de vérité = prenom/nom (Feature users-identite).
export const denormaliserNomComplet: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data

  const prenom = (data.prenom ?? '').trim()
  const nom = (data.nom ?? '').trim()

  if (prenom || nom) {
    data.name = `${prenom} ${nom}`.trim()
  }

  return data
}
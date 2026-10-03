import type { CollectionBeforeChangeHook } from 'payload'

import { detecterDoublonCatalogue } from '@/bibliotheque/domain/livre.doublon'

// Garde métier à la création d'un livre (le client seul n'est pas fiable :
// deux onglets ouverts, import CSV…). Un doublon certain — même ISBN, ou
// même titre + auteur sans ISBN saisi — est refusé avec un message qui
// oriente vers l'ajout d'exemplaires sur la fiche existante. Un ISBN saisi
// différent du référencé (édition distincte probable) passe : l'avertissage
// reste à la discrétion de l'utilisateur.
// Le périmètre est le catalogue ACTIF (archived not_equals true), comme le
// portail : un livre retiré du catalogue n'interdit pas son réimport (sinon
// toute réimport d'un fichier contenant un livre archivé échouerait en masse,
// le client l'annonçant comme importable).
export const livresBeforeChange: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || !data) return data

  const existants = await req.payload.find({
    collection: 'livres',
    depth: 0,
    limit: 0,
    where: { archived: { not_equals: true } },
    select: {
      auteur: true,
      isbn: true,
      titre: true,
    },
  })

  const doublon = detecterDoublonCatalogue(data, existants.docs)
  if (doublon?.gravite === 'bloquant') {
    throw new Error(
      `${doublon.message} Pour ajouter des exemplaires à ce livre, passez par sa fiche (bouton Modifier).`,
    )
  }

  return data
}
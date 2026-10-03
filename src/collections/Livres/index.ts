import type { CollectionConfig } from 'payload'

import { biblioDelete, biblioRead, biblioWrite } from '../../access/biblio'
import { livresBeforeChange } from '../../hooks/livres/livresBeforeChange'
import { compacterIsbn } from '../../bibliotheque/domain/livre.doublon'
import { CATEGORIES_LIVRE, NIVEAUX_LIVRE } from '../../bibliotheque/domain/livre.options'

// Alias : les options de catégorie vivent désormais dans le module domaine
// partagé (livre.options) — maintenu pour les éventuels import historiques.
export const categorieLivreOptions = CATEGORIES_LIVRE

export const Livres: CollectionConfig = {
  slug: 'livres',
  access: {
    create: biblioWrite,
    delete: biblioDelete,
    read: biblioRead,
    update: biblioWrite,
  },
  admin: {
    defaultColumns: ['titre', 'niveau', 'categorie', 'exemplaires'],
    useAsTitle: 'titre',
  },
  fields: [
    {
      label: 'Titre',
      name: 'titre',
      required: true,
      type: 'text',
    },
    {
      label: 'Auteur',
      name: 'auteur',
      type: 'text',
    },
    {
      label: 'ISBN',
      name: 'isbn',
      type: 'text',
      admin: {
        description: 'ISBN-10 ou ISBN-13 (optionnel)',
      },
      validate: (value: string | null | undefined) => {
        const compact = compacterIsbn(value)
        if (!compact) return true
        if (/^\d{10}$/.test(compact) || /^\d{13}$/.test(compact)) return true
        return 'ISBN invalide (10 ou 13 chiffres attendus).'
      },
    },
    {
      label: 'Niveau',
      name: 'niveau',
      options: NIVEAUX_LIVRE,
      type: 'select',
    },
    {
      label: 'Catégorie',
      name: 'categorie',
      options: categorieLivreOptions,
      type: 'select',
    },
    {
      label: 'Éditeur',
      name: 'editeur',
      type: 'text',
    },
    {
      label: 'Résumé',
      name: 'resume',
      type: 'textarea',
      admin: {
        description: 'Présentation de l’ouvrage, affichée sur la fiche du portail',
      },
    },
    {
      label: 'Image de couverture',
      name: 'imageUrl',
      type: 'text',
      admin: {
        description:
          'Adresse web (https://…) de la couverture, affichée sur la fiche du livre dans le portail. L’image n’est pas stockée sur le site.',
      },
      validate: (valeur: null | string | undefined) => {
        if (!valeur) return true
        try {
          const url = new URL(valeur)
          return url.protocol === 'http:' || url.protocol === 'https:'
            ? true
            : 'Saisissez une adresse commençant par https://'
        } catch {
          return 'Saisissez une adresse complète (par exemple https://…/couverture.jpg)'
        }
      },
    },
    {
      defaultValue: false,
      label: 'Retiré du catalogue',
      name: 'archived',
      type: 'checkbox',
      admin: {
        description:
          'Préférer l’archivage à la suppression : un livre avec historique de prêts ne peut pas être supprimé.',
      },
    },
  ],
  hooks: {
    beforeChange: [livresBeforeChange],
  },
  timestamps: true,
}
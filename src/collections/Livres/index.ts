import type { CollectionConfig } from 'payload'

import { biblioDelete, biblioRead, biblioWrite } from '../../access/biblio'
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
        if (!value) return true
        const compact = value.replace(/[\s-]/g, '')
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
  timestamps: true,
}
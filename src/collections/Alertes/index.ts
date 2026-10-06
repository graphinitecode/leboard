import type { CollectionConfig } from 'payload'

import type { CollectionAfterChangeHook } from 'payload'

import { adminOnly } from '../../access/roles'
import { notifierParentsAlerte } from '../../utilities/notifierParents'

export const typeAlerteOptions = [
  { label: 'Décrochage', value: 'decrochage' },
  { label: 'Retard bibliothèque', value: 'retard-bibliotheque' },
  { label: 'Rappel retour', value: 'rappel-retour' },
  { label: 'RGPD — fin de rétention', value: 'rgpd-retention' },
]

export const statutAlerteOptions = [
  { label: 'Nouvelle', value: 'nouvelle' },
  { label: 'Vue', value: 'vue' },
  { label: 'Traitée', value: 'traitee' },
]

// Création d'une alerte qui concerne une famille : e-mail aux parents, puis
// date d'envoi enregistrée (traçabilité, et jamais deux envois par alerte)
const notifierALaCreation: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create' || doc.notifieLe) return doc
  try {
    const envoyes = await notifierParentsAlerte(req.payload, doc)
    if (envoyes > 0) {
      await req.payload.update({
        collection: 'alertes',
        data: { notifieLe: new Date().toISOString() },
        id: doc.id,
        overrideAccess: true,
        req,
      })
    }
  } catch (err) {
    req.payload.logger.error({ err, msg: `alerte ${doc.id} : notification des parents impossible` })
  }
  return doc
}

export const Alertes: CollectionConfig = {
  slug: 'alertes',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    defaultColumns: ['dateCreation', 'type', 'eleve', 'message', 'statut'],
    description: 'Alertes générées par le cron nocturne (décrochage, retards, rétention RGPD)',
    useAsTitle: 'message',
  },
  fields: [
    {
      name: 'type',
      options: typeAlerteOptions,
      required: true,
      type: 'select',
    },
    {
      name: 'eleve',
      relationTo: 'eleves',
      type: 'relationship',
    },
    {
      name: 'pret',
      relationTo: 'prets',
      type: 'relationship',
    },
    {
      name: 'message',
      required: true,
      type: 'text',
    },
    {
      defaultValue: 'nouvelle',
      name: 'statut',
      options: statutAlerteOptions,
      required: true,
      type: 'select',
    },
    {
      name: 'dateCreation',
      defaultValue: () => new Date().toISOString(),
      required: true,
      type: 'date',
      admin: {
        date: { displayFormat: 'dd/MM/yyyy HH:mm', pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'dateTraitement',
      type: 'date',
      admin: {
        date: { displayFormat: 'dd/MM/yyyy HH:mm', pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'notifieLe',
      admin: {
        date: { displayFormat: 'dd/MM/yyyy HH:mm', pickerAppearance: 'dayAndTime' },
        description: 'Date d’envoi de l’e-mail aux parents (vide : non envoyé)',
        readOnly: true,
      },
      label: 'Parents prévenus le',
      type: 'date',
    },
    {
      name: 'resolution',
      type: 'textarea',
      admin: {
        description: 'Action réalisée (ex. parent appelé, profil anonymisé)',
      },
    },
  ],
  hooks: {
    afterChange: [notifierALaCreation],
  },
  timestamps: true,
}
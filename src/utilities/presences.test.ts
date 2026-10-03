import { describe, expect, it } from 'vitest'

import { ordrePresences, trierPresences } from './presences'

// L'historique des présences se lit sur la date de la SÉANCE liée : createdAt
// de la ligne (son ordre de saisie) peut diverger — l'absence est ajoutée
// après coup, ou la séance créée plus tard. Le désordre signalé sur la fiche
// vient de là.
const presence = (
  nom: string,
  options: { matiere?: string; present?: string; seanceDate?: null | string; sansSeance?: boolean },
) => ({
  nom,
  present: options.present ?? 'present',
  seance: options.sansSeance ? null : { date: options.seanceDate ?? null, matiere: options.matiere },
})

const doc = [
  presence('saisie d abord, séance ancienne', { seanceDate: '2026-01-05T09:00:00.000Z', matiere: 'Mathématiques' }),
  presence('absence ajoutée après coup', { seanceDate: '2026-03-10T09:00:00.000Z', matiere: 'Français', present: 'absent' }),
  presence('séance du milieu', { seanceDate: '2026-02-01T09:00:00.000Z', matiere: 'Anglais', present: 'absent-justifie' }),
]

describe('trierPresences', () => {
  it('date : récent d abord par défaut (déjà corrigé du désordre de saisie)', () => {
    expect(trierPresences(doc).map((p) => p.nom)).toEqual([
      'absence ajoutée après coup',
      'séance du milieu',
      'saisie d abord, séance ancienne',
    ])
  })

  it('date : clic sur l entête inverse (ancien d abord)', () => {
    expect(trierPresences(doc, 'date-asc').map((p) => p.nom)).toEqual([
      'saisie d abord, séance ancienne',
      'séance du milieu',
      'absence ajoutée après coup',
    ])
  })

  it('matière : alphabétique, date récente pour départager', () => {
    expect(trierPresences(doc, 'matiere').map((p) => p.seance?.matiere ?? '')).toEqual([
      'Anglais',
      'Français',
      'Mathématiques',
    ])
  })

  it('statut : absences groupées en tête, récentes d abord', () => {
    expect(trierPresences(doc, 'statut').map((p) => p.nom)).toEqual([
      'absence ajoutée après coup',
      'séance du milieu',
      'saisie d abord, séance ancienne',
    ])
  })

  it('ne mute pas la liste d entrée', () => {
    const liste = [
      presence('ancienne', { seanceDate: '2026-01-05T09:00:00.000Z' }),
      presence('récente', { seanceDate: '2026-03-01T09:00:00.000Z' }),
    ]
    trierPresences(liste)
    expect(liste.map((p) => p.nom)).toEqual(['ancienne', 'récente'])
  })

  it('envoie les lignes sans séance datée en fin d historique', () => {
    const melange = [...doc, presence('date vide', { seanceDate: null }), presence('sans séance', { sansSeance: true })]
    const ordre = trierPresences(melange).map((p) => p.nom)
    expect(ordre.slice(0, 3)).toEqual([
      'absence ajoutée après coup',
      'séance du milieu',
      'saisie d abord, séance ancienne',
    ])
    expect(ordre.slice(3).sort()).toEqual(['date vide', 'sans séance'])
  })
})

describe('ordrePresences', () => {
  it('reprend la valeur du paramètre quand reconnue, sinon le défaut', () => {
    expect(ordrePresences('matiere')).toEqual('matiere')
    expect(ordrePresences('date-asc')).toEqual('date-asc')
    expect(ordrePresences('pirate')).toEqual('date-desc')
    expect(ordrePresences(undefined)).toEqual('date-desc')
    expect(ordrePresences(null)).toEqual('date-desc')
  })
})
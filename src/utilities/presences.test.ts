import { describe, expect, it } from 'vitest'

import {
  ordrePresences,
  paginerParPage,
  trierPresences,
} from './presences'

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
describe('paginerParPage', () => {
  const lots = Array.from({ length: 23 }, (_, i) => i) // 0..22

  it('page 1 : les 10 premières lignes', () => {
    const resultat = paginerParPage(lots, 1)
    expect(resultat).toEqual({ lignes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], page: 1, totalPages: 3 })
  })

  it('page du milieu : le lot voulu', () => {
    const resultat = paginerParPage(lots, 2)
    expect(resultat.lignes).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
    expect(resultat.page).toBe(2)
  })

  it('dernière page partielle : les 3 dernières lignes', () => {
    const resultat = paginerParPage(lots, 3)
    expect(resultat.lignes).toEqual([20, 21, 22])
    expect(resultat.totalPages).toBe(3)
  })

  it('page hors bornes : bornée à la dernière', () => {
    const resultat = paginerParPage(lots, 99)
    expect(resultat.page).toBe(3)
    expect(resultat.lignes).toEqual([20, 21, 22])
  })

  it('page invalide : bornée à la première', () => {
    const resultat = paginerParPage(lots, Number('abc'))
    expect(resultat.page).toBe(1)
  })

  it('liste vide : une page vide, pas de division impossible', () => {
    const resultat = paginerParPage([], 1)
    expect(resultat).toEqual({ lignes: [], page: 1, totalPages: 1 })
  })

  it('moins de lignes qu\'un lot : une seule page', () => {
    const resultat = paginerParPage([1, 2], 1)
    expect(resultat).toEqual({ lignes: [1, 2], page: 1, totalPages: 1 })
  })
})

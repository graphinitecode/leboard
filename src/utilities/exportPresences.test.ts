import { describe, expect, it } from 'vitest'

import { lignesExportPresences, lireParametresExport, periodeAnneeScolaire } from './exportPresences'

const seance = (date: string, matiere = 'maths') => ({
  date,
  duree: 60,
  matiere,
  prof: { nom: 'Curie', prenom: 'Marie' },
})

describe('lignesExportPresences', () => {
  it('trie par date puis élève, en heure de Paris, avec des libellés lisibles', () => {
    const lignes = lignesExportPresences([
      { eleve: { nom: 'Roux', prenom: 'Emma' }, present: 'absent-justifie', seance: seance('2026-10-27T13:00:00.000Z', 'francais') },
      { eleve: { nom: 'Martin', prenom: 'Lucas' }, present: 'present', seance: seance('2026-10-20T12:00:00.000Z') },
      { eleve: { nom: 'Diallo', prenom: 'Inès' }, present: 'absent', seance: seance('2026-10-20T12:00:00.000Z') },
    ])
    expect(lignes).toEqual([
      ['Date', 'Heure', 'Durée (min)', 'Matière', 'Prof', 'Élève', 'Statut'],
      ['20/10/2026', '14:00', '60', 'Maths', 'Marie Curie', 'Inès Diallo', 'Absent'],
      ['20/10/2026', '14:00', '60', 'Maths', 'Marie Curie', 'Lucas Martin', 'Présent'],
      // Heure d'hiver : 13h UTC = 14h à Paris
      ['27/10/2026', '14:00', '60', 'Français', 'Marie Curie', 'Emma Roux', 'Absent (justifié)'],
    ])
  })
})

describe('lireParametresExport', () => {
  it('borne la période en jours entiers à Paris, fin incluse', () => {
    const resultat = lireParametresExport(new URLSearchParams('debut=2026-09-01&fin=2026-10-31&eleve=7'))
    expect(resultat).toEqual({
      avant: new Date('2026-10-31T23:00:00.000Z'),
      depuis: new Date('2026-08-31T22:00:00.000Z'),
      eleveId: 7,
      ok: true,
    })
  })

  it('accepte une période ouverte', () => {
    expect(lireParametresExport(new URLSearchParams(''))).toEqual({ avant: null, depuis: null, eleveId: null, ok: true })
  })

  it('refuse des paramètres invalides', () => {
    expect(lireParametresExport(new URLSearchParams('debut=01/09/2026')).ok).toBe(false)
    expect(lireParametresExport(new URLSearchParams('debut=2026-10-31&fin=2026-09-01')).ok).toBe(false)
    expect(lireParametresExport(new URLSearchParams('eleve=abc')).ok).toBe(false)
  })
})

describe('periodeAnneeScolaire', () => {
  it("commence au 1er septembre de l'année scolaire en cours", () => {
    expect(periodeAnneeScolaire(new Date(2026, 9, 6))).toEqual({ debut: '2026-09-01', fin: '2026-10-06' })
    expect(periodeAnneeScolaire(new Date(2027, 2, 15))).toEqual({ debut: '2026-09-01', fin: '2027-03-15' })
  })
})

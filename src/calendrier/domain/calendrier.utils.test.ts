import { describe, expect, it } from 'vitest'

import {
  ajouterJours,
  ajouterSemaines,
  arrondirAuCreneau,
  bandeEnMinutes,
  brouillonDepuisPlage,
  bornesSemaine,
  chevaucheUne,
  couleurMatiere,
  dateCiblee,
  debutSemaine,
  dureeBornee,
  dureePlage,
  filtrerSemaine,
  heureDepuisRangee,
  indexJourGrille,
  joursAvecSeances,
  labelDuree,
  dureeRedimensionnee,
  depasseFinCours,
  jourVoisin,
  labelSemaine,
  matiereFiable,
  plageDepuisCases,
  positionMinutes,
  rangeeDepuisHeure,
  rangeesGrille,
  seChevauchent,
  seancesDuJourTriees,
} from '@/calendrier/domain/calendrier.utils'
import type { EventCalendrier } from '@/calendrier/domain/calendrier.entity'

const event = (id: number, iso: string, dureeMin = 60): EventCalendrier => ({
  id,
  debut: new Date(iso),
  dureeMin,
  matiere: 'maths',
  labelGroupe: '',
  href: '',
})

describe('debutSemaine', () => {
  it('renvoie le lundi a minuit pour un mercredi', () => {
    const mercredi = new Date(2025, 8, 24, 15, 30) // mercredi 24/09/2025
    const lundi = debutSemaine(mercredi)
    expect(lundi.getDay()).toBe(1)
    expect(lundi.getHours()).toBe(0)
    expect(lundi.getDate()).toBe(22)
  })

  it('reste dans la semaine pour un dimanche', () => {
    const dimanche = new Date(2025, 8, 28)
    const lundi = debutSemaine(dimanche)
    expect(lundi.getDate()).toBe(22)
  })
})

describe('ajouterSemaines', () => {
  it('ajoute 7 jours par semaine', () => {
    const lundi = new Date(2025, 8, 22)
    const suivant = ajouterSemaines(lundi, 1)
    expect(suivant.getDate()).toBe(29)
    expect(suivant.getDay()).toBe(1)
  })
})

describe('bornesSemaine', () => {
  it('couvre du lundi 00:00 au dimanche 23:59', () => {
    const lundi = new Date(2025, 8, 22)
    const { debut, fin } = bornesSemaine(lundi)
    expect(debut.getHours()).toBe(0)
    expect(fin.getDate()).toBe(28)
    expect(fin.getHours()).toBe(23)
  })
})

describe('indexJourGrille', () => {
  it('convertit lundi=0, samedi=5, dimanche=6', () => {
    expect(indexJourGrille(new Date(2025, 8, 22))).toBe(0)
    expect(indexJourGrille(new Date(2025, 8, 27))).toBe(5)
    expect(indexJourGrille(new Date(2025, 8, 28))).toBe(6)
  })
})

describe('filtrerSemaine', () => {
  it('ne garde que les seances de la semaine', () => {
    const lundi = new Date(2025, 8, 22)
    const events = [
      event(1, '2025-09-23T14:00:00'),
      event(2, '2025-09-29T14:00:00'),
      event(3, '2025-09-21T14:00:00'),
    ]
    expect(filtrerSemaine(events, lundi).map((e) => e.id)).toEqual([1])
  })
})

describe('positionMinutes', () => {
  it('mesure depuis 8h et borne la grille', () => {
    expect(positionMinutes(new Date(2025, 8, 23, 14, 0))).toBe(6 * 60)
    expect(positionMinutes(new Date(2025, 8, 23, 7, 30))).toBe(0)
    expect(positionMinutes(new Date(2025, 8, 23, 19, 0))).toBe(10 * 60)
  })
})

describe('dureeBornee', () => {
  it('borne entre 30 min et la fin de grille', () => {
    expect(dureeBornee(10)).toBe(30)
    expect(dureeBornee(800)).toBe(10 * 60)
    expect(dureeBornee(90)).toBe(90)
  })
})

describe('arrondirAuCreneau', () => {
  it('arrondit au creneau de 30 min inferieur', () => {
    const { heureDebut, jourIndex } = arrondirAuCreneau(new Date(2025, 8, 23, 15, 20))
    expect(heureDebut).toBe('15:00')
    expect(jourIndex).toBe(1)
  })
})

describe('seChevauchent / chevaucheUne', () => {
  it('detecte le chevauchement meme jour', () => {
    const a = event(1, '2025-09-23T14:00:00', 60)
    const b = event(2, '2025-09-23T14:30:00', 60)
    expect(seChevauchent(a, b)).toBe(true)
  })

  it('n\'interpelle pas deux seances distantes', () => {
    const a = event(1, '2025-09-23T14:00:00', 60)
    const b = event(2, '2025-09-23T15:00:00', 60)
    expect(seChevauchent(a, b)).toBe(false)
  })

  it('chevaucheUne ignore la seance deplacee', () => {
    const a = event(1, '2025-09-23T14:00:00', 60)
    const b = event(2, '2025-09-23T14:30:00', 60)
    expect(chevaucheUne({ debut: new Date('2025-09-23T14:30:00'), dureeMin: 60 }, [a, b], 1)).toEqual(b)
  })
})

describe('dateCiblee', () => {
  it('combine le lundi et la cible jour/heure', () => {
    const lundi = new Date(2025, 8, 22)
    const date = dateCiblee(lundi, { jourIndex: 2, heureDebut: '16:30' })
    expect(date.getDate()).toBe(24)
    expect(date.getHours()).toBe(16)
    expect(date.getMinutes()).toBe(30)
  })
})

describe('bandeEnMinutes', () => {
  it('convertit une dispo en bornes', () => {
    expect(bandeEnMinutes({ jour: 'mardi', heureDebut: '17:00', heureFin: '19:00' })).toEqual([
      17 * 60,
      19 * 60,
    ])
  })
})

describe('labelSemaine', () => {
  it('condense le mois quand la semaine reste dans le mois', () => {
    expect(labelSemaine(new Date(2025, 8, 22))).toBe('Semaine du 22 au 28 septembre')
  })

  it('affiche les deux mois a cheval', () => {
    expect(labelSemaine(new Date(2025, 8, 29))).toBe('Semaine du 29 septembre au 5 octobre')
  })
})

describe('rangeesGrille', () => {
  it('couvre 8h a 18h par pas de 30 min', () => {
    const rangees = rangeesGrille()
    expect(rangees[0]).toBe('08:00')
    expect(rangees[rangees.length - 1]).toBe('17:30')
    expect(rangees).toHaveLength(20)
  })
})

describe('couleurMatiere / matiereFiable', () => {
  it('mappe chaque matiere sur sa couleur', () => {
    expect(couleurMatiere('maths')).toBe('blue')
    expect(couleurMatiere('francais')).toBe('violet')
    expect(couleurMatiere('anglais')).toBe('orange')
    expect(couleurMatiere('autre')).toBe('teal')
  })

  it('replie une matiere inconnue vers autre', () => {
    expect(matiereFiable('latin')).toBe('autre')
    expect(matiereFiable('anglais')).toBe('anglais')
  })
})

describe('rangeeDepuisHeure / heureDepuisRangee', () => {
  it('convertit dans les deux sens', () => {
    expect(rangeeDepuisHeure('14:00')).toBe(12)
    expect(rangeeDepuisHeure('08:00')).toBe(0)
    expect(heureDepuisRangee(12)).toBe('14:00')
    expect(heureDepuisRangee(0)).toBe('08:00')
    expect(heureDepuisRangee(999)).toBe('17:30')
  })
})

describe('plageDepuisCases / dureePlage / brouillonDepuisPlage', () => {
  it('normalise le sens du glisser (bas vers haut)', () => {
    const plage = plageDepuisCases(14, 12)
    expect(plage.rangeeDebut).toBe(12)
    expect(plage.rangeeFin).toBe(15)
  })

  it('calcule la duree minimum un creneau', () => {
    expect(dureePlage({ jourIndex: 0, rangeeDebut: 12, rangeeFin: 14 })).toBe(60)
    expect(dureePlage({ jourIndex: 0, rangeeDebut: 12, rangeeFin: 12 })).toBe(30)
  })

  it('construit le brouillon d assistant', () => {
    const brouillon = brouillonDepuisPlage({ jourIndex: 2, rangeeDebut: 12, rangeeFin: 15 })
    expect(brouillon.jourIndex).toBe(2)
    expect(brouillon.heureDebut).toBe('14:00')
    expect(brouillon.heureFin).toBe('15:30')
  })
})

describe('ajouterJours', () => {
  it('decale du nombre de jours', () => {
    expect(ajouterJours(new Date(2025, 8, 22), 1).getDate()).toBe(23)
    expect(ajouterJours(new Date(2025, 8, 22), -1).getDate()).toBe(21)
  })
})

describe('seancesDuJourTriees / joursAvecSeances', () => {
  it('trie par heure et liste les jours occupes', () => {
    const events = [
      event(1, '2025-09-23T14:00:00'),
      event(2, '2025-09-23T10:00:00'),
      event(3, '2025-09-25T16:00:00'),
    ]
    const triees = seancesDuJourTriees(events, 1)
    expect(triees.map((e) => e.debut.getHours())).toEqual([10, 14])
    expect(joursAvecSeances(events)).toEqual([1, 3])
  })
})
describe('jourVoisin', () => {
  const lundi = new Date(2025, 8, 22)

  it('avance et recule depuis le jour affiché, pas depuis le lundi', () => {
    expect(jourVoisin(lundi, 2, 1)).toEqual({ lundi, jourIndex: 3 })
    expect(jourVoisin(lundi, 2, -1)).toEqual({ lundi, jourIndex: 1 })
  })

  it('passe par le dimanche et change de semaine aux bornes', () => {
    expect(jourVoisin(lundi, 5, 1)).toEqual({ lundi, jourIndex: 6 })
    expect(jourVoisin(lundi, 6, 1)).toEqual({ lundi: new Date(2025, 8, 29), jourIndex: 0 })
    expect(jourVoisin(lundi, 0, -1)).toEqual({ lundi: new Date(2025, 8, 15), jourIndex: 6 })
  })
})

describe('labelDuree', () => {
  // Espaces insécables : la durée ne se coupe pas
  const sansCoupure = (texte: string) => texte.replace(/ /g, '\u00a0')

  it('formate minutes et heures', () => {
    expect(labelDuree(30)).toBe(sansCoupure('30 min'))
    expect(labelDuree(60)).toBe(sansCoupure('1 h'))
    expect(labelDuree(90)).toBe(sansCoupure('1 h 30'))
    expect(labelDuree(135)).toBe(sansCoupure('2 h 15'))
  })
})

describe('dureeRedimensionnee', () => {
  const debut = new Date(2025, 8, 22, 14, 0)

  it('arrondit au créneau de 30 min', () => {
    expect(dureeRedimensionnee(debut, 60, 20)).toBe(90)
    expect(dureeRedimensionnee(debut, 60, -20)).toBe(30)
  })

  it('garde au moins un créneau et ne dépasse pas la fin des cours (18h)', () => {
    const debut16h = new Date(2025, 8, 22, 16, 0)
    expect(dureeRedimensionnee(debut16h, 60, -120)).toBe(30)
    expect(dureeRedimensionnee(debut16h, 60, 300)).toBe(120)
  })
})

describe('depasseFinCours', () => {
  it('refuse une séance qui finit après 18h', () => {
    expect(depasseFinCours(new Date(2025, 8, 22, 17, 0), 60)).toBe(false)
    expect(depasseFinCours(new Date(2025, 8, 22, 17, 30), 60)).toBe(true)
  })
})

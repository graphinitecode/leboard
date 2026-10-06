import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import type { Alerte } from '@/payload-types'

import { contenuEmail, notifierParentsAlerte } from './notifierParents'

const URL_SITE = 'https://lpv.example'

describe('contenuEmail', () => {
  it('retard de livre : titre, date et liens vers la fiche et le profil', () => {
    const { sujet, texte, html } = contenuEmail('retard-bibliotheque', {
      dateRetour: '2026-10-01T10:00:00.000Z',
      eleveId: 7,
      prenomEleve: 'Lucas',
      titreLivre: 'Le Petit Prince',
      urlSite: URL_SITE,
    })
    expect(sujet).toBe('Livre à rendre : Le Petit Prince')
    expect(texte).toContain('« Le Petit Prince », emprunté par Lucas')
    expect(texte).toContain('devait être rendu le 1 octobre')
    expect(texte).toContain('https://lpv.example/parents/enfants/7')
    expect(html).toContain('href="https://lpv.example/parents/mon-profil"')
  })

  it('rappel de retour', () => {
    const { sujet, texte } = contenuEmail('rappel-retour', {
      dateRetour: '2026-10-09T10:00:00.000Z',
      eleveId: 7,
      prenomEleve: 'Lucas',
      titreLivre: 'Matilda',
      urlSite: URL_SITE,
    })
    expect(sujet).toBe('Rappel : Matilda à rendre le 9 octobre')
    expect(texte).toContain('est à rendre le 9 octobre')
  })

  it('décrochage : constat repris, ton bienveillant', () => {
    const { sujet, texte } = contenuEmail('decrochage', {
      constat: '3 absences sur les 5 dernières séances',
      eleveId: 7,
      prenomEleve: 'Lucas',
      urlSite: URL_SITE,
    })
    expect(sujet).toBe('Absences de Lucas aux séances')
    expect(texte).toContain('(3 absences sur les 5 dernières séances)')
    expect(texte).toContain('chercher ensemble une solution')
  })

  it('échappe le HTML des données', () => {
    const { html } = contenuEmail('retard-bibliotheque', {
      eleveId: 7,
      prenomEleve: '<b>Lucas</b>',
      titreLivre: 'A & B',
      urlSite: URL_SITE,
    })
    expect(html).not.toContain('<b>Lucas</b>')
    expect(html).toContain('&lt;b&gt;Lucas&lt;/b&gt;')
    expect(html).toContain('A &amp; B')
  })
})

describe('notifierParentsAlerte', () => {
  const fauxPayload = (parents: unknown[], sendEmail = vi.fn().mockResolvedValue(undefined)) => {
    const payload = {
      findByID: vi.fn(async ({ collection }: { collection: string }) =>
        collection === 'eleves'
          ? { id: 7, parents, prenom: 'Lucas' }
          : {
              dateRetourPrevue: '2026-10-01T10:00:00.000Z',
              exemplaire: { livre: { titre: 'Le Petit Prince' } },
            },
      ),
      logger: { error: vi.fn() },
      sendEmail,
    }
    return payload as unknown as Payload & { sendEmail: typeof sendEmail; logger: { error: ReturnType<typeof vi.fn> } }
  }

  const alerte = (type: string): Alerte =>
    ({ eleve: 7, id: 1, message: 'Retard', pret: 3, type }) as unknown as Alerte

  it('écrit à chaque parent qui accepte les alertes', async () => {
    const payload = fauxPayload([
      { alertesEmail: true, email: 'a@lpv.fr', id: 1 },
      { email: 'b@lpv.fr', id: 2 },
      { alertesEmail: false, email: 'c@lpv.fr', id: 3 },
    ])
    expect(await notifierParentsAlerte(payload, alerte('retard-bibliotheque'))).toBe(2)
    expect(payload.sendEmail.mock.calls.map(([e]) => e.to)).toEqual(['a@lpv.fr', 'b@lpv.fr'])
    expect(payload.sendEmail.mock.calls[0][0].subject).toBe('Livre à rendre : Le Petit Prince')
  })

  it("n'envoie rien pour une alerte interne (fin de rétention RGPD)", async () => {
    const payload = fauxPayload([{ email: 'a@lpv.fr', id: 1 }])
    expect(await notifierParentsAlerte(payload, alerte('rgpd-retention'))).toBe(0)
    expect(payload.sendEmail).not.toHaveBeenCalled()
  })

  it("un échec d'envoi est journalisé sans interrompre les autres envois", async () => {
    const sendEmail = vi.fn().mockRejectedValueOnce(new Error('Resend indisponible')).mockResolvedValue(undefined)
    const payload = fauxPayload(
      [
        { email: 'a@lpv.fr', id: 1 },
        { email: 'b@lpv.fr', id: 2 },
      ],
      sendEmail,
    )
    expect(await notifierParentsAlerte(payload, alerte('rappel-retour'))).toBe(1)
    expect(payload.logger.error).toHaveBeenCalledTimes(1)
  })
})

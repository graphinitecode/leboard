import type { Payload } from 'payload'

import type { Alerte, Eleve, Exemplaire, Livre, Pret, User } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

// Alertes qui concernent directement une famille et lui sont envoyées par
// e-mail (la fin de rétention RGPD reste un sujet interne à l'association)
export const TYPES_NOTIFIES = ['decrochage', 'retard-bibliotheque', 'rappel-retour'] as const
export type TypeNotifie = (typeof TYPES_NOTIFIES)[number]

export const estTypeNotifie = (type: string): type is TypeNotifie =>
  (TYPES_NOTIFIES as readonly string[]).includes(type)

export interface ContexteEmail {
  prenomEleve: string
  eleveId: number
  // Retards et rappels : titre du livre et date de retour prévue
  titreLivre?: string | null
  dateRetour?: string | null
  // Décrochage : constat chiffré (« 3 absences sur les 5 dernières séances »)
  constat?: string
  urlSite: string
}

export interface ContenuEmail {
  sujet: string
  texte: string
  html: string
}

const echapper = (texte: string): string =>
  texte.replace(/[&<>"']/g, (c) => ({ '"': '&quot;', '&': '&amp;', "'": '&#39;', '<': '&lt;', '>': '&gt;' })[c] as string)

const dateLongue = (iso: string | null | undefined): string =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
    : 'la date prévue'

// Contenu de l'e-mail adressé aux parents pour une alerte. Texte brut et HTML
// portent le même message : lien vers la fiche de l'enfant et désinscription.
export function contenuEmail(type: TypeNotifie, contexte: ContexteEmail): ContenuEmail {
  const { prenomEleve, urlSite, eleveId } = contexte
  const livre = contexte.titreLivre ? `« ${contexte.titreLivre} »` : 'le livre emprunté'
  const date = dateLongue(contexte.dateRetour)

  const corps: Record<TypeNotifie, { sujet: string; paragraphes: string[] }> = {
    'decrochage': {
      paragraphes: [
        `Nous avons remarqué plusieurs absences de ${prenomEleve} aux dernières séances de soutien${contexte.constat ? ` (${contexte.constat.toLowerCase()})` : ''}.`,
        'Si quelque chose empêche votre enfant de venir, n’hésitez pas à nous en parler : nous pouvons chercher ensemble une solution.',
      ],
      sujet: `Absences de ${prenomEleve} aux séances`,
    },
    'rappel-retour': {
      paragraphes: [
        `Le livre ${livre}, emprunté par ${prenomEleve} à la bibliothèque de l’association, est à rendre le ${date}.`,
        'Merci de penser à le rapporter lors de la prochaine séance.',
      ],
      sujet: `Rappel : ${contexte.titreLivre ?? 'livre'} à rendre le ${date}`,
    },
    'retard-bibliotheque': {
      paragraphes: [
        `Le livre ${livre}, emprunté par ${prenomEleve} à la bibliothèque de l’association, devait être rendu le ${date}.`,
        'Merci de le rapporter dès que possible, pour que d’autres élèves puissent l’emprunter.',
      ],
      sujet: `Livre à rendre : ${contexte.titreLivre ?? 'retour en retard'}`,
    },
  }

  const { sujet, paragraphes } = corps[type]
  const lienFiche = `${urlSite}/parents/enfants/${eleveId}`
  const lienProfil = `${urlSite}/parents/mon-profil`
  const piedTexte = `Vous recevez cet e-mail car vous suivez ${prenomEleve} sur l’espace parents. Pour ne plus recevoir ces alertes, décochez l’option dans « Mon profil » : ${lienProfil}`

  const texte = [
    'Bonjour,',
    ...paragraphes,
    `Suivi de ${prenomEleve} : ${lienFiche}`,
    'L’équipe de l’association Les Pierres Vivantes',
    '—',
    piedTexte,
  ].join('\n\n')

  const html = `<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#0b0c0c;max-width:36rem">
<p>Bonjour,</p>
${paragraphes.map((p) => `<p>${echapper(p)}</p>`).join('\n')}
<p><a href="${echapper(lienFiche)}">Voir le suivi de ${echapper(prenomEleve)}</a></p>
<p>L’équipe de l’association Les Pierres Vivantes</p>
<hr style="border:0;border-top:1px solid #b1b4b6">
<p style="font-size:14px;color:#505a5f">Vous recevez cet e-mail car vous suivez ${echapper(prenomEleve)} sur l’espace parents. Pour ne plus recevoir ces alertes, décochez l’option dans <a href="${echapper(lienProfil)}">Mon profil</a>.</p>
</body></html>`

  return { html, sujet, texte }
}

const idDe = (relation: unknown): number | undefined =>
  typeof relation === 'object' && relation !== null ? (relation as { id: number }).id : (relation as number | undefined)

// Envoie l'alerte aux parents de l'élève qui n'ont pas désactivé les alertes
// par e-mail. Renvoie le nombre d'e-mails envoyés ; une erreur d'envoi est
// journalisée sans interrompre le traitement (le cron continue).
export async function notifierParentsAlerte(payload: Payload, alerte: Alerte): Promise<number> {
  if (!estTypeNotifie(alerte.type)) return 0
  const eleveId = idDe(alerte.eleve)
  if (!eleveId) return 0

  const eleve = (await payload.findByID({ collection: 'eleves', depth: 1, id: eleveId })) as Eleve
  const parents = (eleve.parents ?? []).filter(
    (p): p is User => typeof p === 'object' && p !== null && Boolean(p.email) && p.alertesEmail !== false,
  )
  if (parents.length === 0) return 0

  let titreLivre: string | null = null
  let dateRetour: string | null = null
  const pretId = idDe(alerte.pret)
  if (pretId) {
    const pret = (await payload.findByID({ collection: 'prets', depth: 2, id: pretId })) as Pret
    const exemplaire = pret.exemplaire as Exemplaire | number
    const livre = typeof exemplaire === 'object' ? (exemplaire.livre as Livre | number) : null
    titreLivre = typeof livre === 'object' && livre !== null ? livre.titre : null
    dateRetour = pret.dateRetourPrevue ?? null
  }

  const contenu = contenuEmail(alerte.type, {
    constat: alerte.type === 'decrochage' ? alerte.message : undefined,
    dateRetour,
    eleveId,
    prenomEleve: eleve.prenom,
    titreLivre,
    urlSite: getServerSideURL(),
  })

  let envoyes = 0
  for (const parent of parents) {
    try {
      await payload.sendEmail({ html: contenu.html, subject: contenu.sujet, text: contenu.texte, to: parent.email })
      envoyes++
    } catch (err) {
      payload.logger.error({ err, msg: `alerte ${alerte.id} : e-mail non envoyé au parent ${parent.id}` })
    }
  }
  return envoyes
}

# Spec 16 — Alertes par e-mail aux parents

## 1. Objectif
Prévenir les familles par e-mail quand le cron détecte une situation qui les concerne : livre en retard, livre à rendre bientôt, absences répétées.

## 2. Valeur utilisateur
- Les parents sont informés sans attendre un appel de l'association.
- L'association garde la trace de chaque envoi sur l'alerte.

## 3. Périmètre
- **Inclus** : e-mail à la création d'une alerte `retard-bibliotheque`, `rappel-retour` ou `decrochage` ; désinscription dans « Mon profil » (parents) ; date d'envoi sur l'alerte.
- **Exclu** : alerte `rgpd-retention` (sujet interne) ; relances périodiques d'une même alerte ; SMS.

## 4. Spécification fonctionnelle
- Destinataires : les comptes parents reliés à l'élève (`eleves.parents`) dont l'option « Recevoir les alertes par e-mail » est active (cochée par défaut).
- Un e-mail par alerte créée et par parent, jamais deux fois : l'alerte enregistre « Parents prévenus le ».
- Un échec d'envoi est journalisé ; il n'interrompt ni le cron ni les autres envois.
- Sans Resend configuré, Payload journalise l'e-mail au lieu de l'envoyer.

## 5. UI / UX
### 5.6 Micro-copy (FR)
- Retard : « Livre à rendre : {titre} » — « Le livre « {titre} », emprunté par {prénom}…, devait être rendu le {date}. »
- Rappel : « Rappel : {titre} à rendre le {date} ».
- Absences : « Absences de {prénom} aux séances » — ton bienveillant, invitation à en parler.
- Pied : lien vers la fiche de l'enfant et vers « Mon profil » pour se désinscrire.

## 6. Spécification technique
- `src/utilities/notifierParents.ts` : `contenuEmail` (pure), `notifierParentsAlerte`.
- Hook `afterChange` (création) de `alertes` ; champs `alertes.notifieLe`, `users.alertesEmail` ; migration `20261006_130535_alertes_email`.
- `updateMonProfil` n'accepte la préférence que pour un compte parent.

## 7. Critères d'acceptation
- [x] Une alerte famille crée un e-mail par parent abonné ; aucun pour `rgpd-retention`.
- [x] Un parent désinscrit ne reçoit rien ; la case est dans « Mon profil ».
- [x] La date d'envoi est enregistrée sur l'alerte.
- [x] Un échec d'envoi n'interrompt pas le traitement.
- [x] Lint, typecheck, tests passent.

## 8. Risques & questions ouvertes
- La politique de protection des données doit mentionner ces e-mails (contenu à mettre à jour dans l'admin, global « Politique RGPD »).
- `RESEND_FROM_EMAIL` doit être un domaine vérifié chez Resend en production.

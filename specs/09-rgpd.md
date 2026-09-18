# Spec 09 — RGPD : consentement, rétention, droits des personnes

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : M · **Dépendances** : Spec 01, Spec 02 (techniquement léger, mais à penser dès la première mise en production)

## 1. Objectif
Mettre l'application en conformité RGPD pour le traitement de données de mineurs : consentement parental documenté à la création du profil enfant, durée de conservation définie et appliquée, et exercice des droits (accès, rectification, effacement, portabilité) sans intervention technique manuelle.

## 2. Valeur utilisateur
- Obligation légale dès qu'on stocke des données de mineurs — mieux conçu dès le départ que rétrofité.
- Confiance des familles : elles savent ce qui est stocké, pourquoi, et comment le faire supprimer.
- Protection de l'association : registre des traitements, preuve de consentement, procédures documentées (en cas de contrôle CNIL).

## 3. Périmètre
- **Inclus** :
  - Champs de consentement sur `eleves` : `consentementRGPD` (checkbox), `dateConsentement` (date), `quiAConsenti` (relation parent), version de la politique acceptée.
  - Blocage de la création d'un élève sans consentement (validation), avec dérogation documentée pour élève majeur.
  - Global `politiqueRgpd` : texte de la politique (versionné), affichable publiquement (`/rgpd`).
  - Rétention : durée (défaut : 3 ans après la fin d'adhésion) + job nocturne (branché sur le cron Spec 05) qui identifie les profils arrivés à échéance → alerte admin (décision humaine avant suppression, pas de purge aveugle).
  - Export des données d'un élève (JSON) et suppression/anonymisation en un clic (admin).
  - Page `/rgpd` : politique lisible par les familles.
- **Exclu** (pour cette itération) :
  - Registre des traitements formel hors app (document Word géré par l'asso) — l'app référence juste où il est.
  - Double opt-in électronique avec signature (checkbox horodatée suffit en v1 ; l'asso collecte le papier en parallèle si elle le souhaite).
  - Anonymisation partielle fine (on anonymise tout le profil sorti).

## 4. Spécification fonctionnelle

### 4.1 Consentement
- À la création d'un élève (mineur) : `consentementRGPD = true` obligatoire, avec `quiAConsenti` (un parent lié) et `dateConsentement` auto (now) ; `versionConsentement` = version courante de la politique.
- Dérogation majeur : si `dateNaissance` ≥ 18 ans à la création, le consentement peut être donné par l'élève lui-même (champ `quiAConsenti` = option « l'élève ») — validation conditionnelle.
- Sans consentement valide : l'élève ne peut pas être créé (message explicite). Un élève créé reste utilisable même si la version de politique évolue (pas de re-consentement automatique en v1 ; alerte admin si version obsolète — v2).

### 4.2 Rétention
- Champs sur `eleves` : `dateFinAdhesion` (date, optionnel — renseignée quand l'élève quitte l'asso).
- Durée de rétention : 3 ans après `dateFinAdhesion` (paramétrable dans la config). À l'échéance : le job nocturne crée une alerte `rgpd-retention` (type ajouté à Spec 05) : « Profil de {élève} à supprimer (fin d'adhésion le {date} + 3 ans) ».
- L'admin décide : supprimer/anonymiser (action dédiée) ou repousser (met à jour `dateFinAdhesion` si l'adhésion continue en réalité).
- Suppression d'un compte user parent (rétractation) : anonymiser les références (le parent sort de `eleves.parents`), conserver les données pédagogiques agrégées ? Non : si plus aucun parent lié ni contact, l'élève passe aussi en flux de rétention.

### 4.3 Droits des personnes
- **Accès/Portabilité** : bouton admin « Exporter les données de cet élève » → JSON complet (élève, présences, progressions, prêts, retours le concernant) téléchargeable ; remis à la famille.
- **Rectification** : les parents peuvent demander des corrections via l'asso (le portail est en lecture seule, Spec 06) — pas d'édition directe en v1.
- **Effacement** : bouton admin « Anonymiser » : remplace identité (prénom/nom → « Élève #ID », dateNaissance → année seule), purge commentaires/retours nominatifs le concernant, conserve les données statistiques (présences sans nom) pour l'historique de l'asso. Journalisé (qui, quand — dans `alertes` ou log serveur).
- **Rétractation du consentement** : un parent peut le demander par email → l'admin anonymise (4.3) ; le consentement retiré bloque toute nouvelle saisie pédagogique (hook qui avertit si l'élève est marqué « consentement retiré »).

### 4.4 Minimisation & sécurité
- Pas de données sensibles au sens RGPD art. 9 (santé, etc.) : le champ `commentaire` des absences doit rester factuel (micro-copy : « Motif factuel uniquement (ex. maladie), pas de détail médical »).
- Hébergement : Vercel/Neon UE — à confirmer (transfert hors UE à documenter si besoin).
- Chiffré en transit (HTTPS partout) ; secrets en variables d'environnement.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- Formulaire élève (admin) : section « Consentement RGPD » obligatoire.
- Fiche élève : actions « Exporter les données » / « Anonymiser » (menu déroulant, confirmation).
- Page publique `/rgpd`.

### 5.2 Disposition (wireframe)
```
Fiche élève (admin)
┌────────────────────────────────────────┐
│ Consentement RGPD  [x] consenti        │
│ Par : Marie Martin (parent) · 12/09    │
│ Version : v1.0   [Exporter les données] │
│                  [Anonymiser…]         │
└────────────────────────────────────────┘
/rgpd (public) : politique en 6 sections courtes, datée, versionnée.
```

### 5.3 États & interactions
- Anonymisation : modale de confirmation avec champ de confirmation texte (« ANONYMISER ») — action irréversible.
- Export : téléchargement direct `eleve-{id}.json`.

### 5.4 Responsive
Admin natif ; `/rgpd` responsive simple.

### 5.5 Thème clair/sombre & accessibilité
`/rgpd` : typographie lisible, titres hiérarchisés, pas de jargon juridique sans explication.

### 5.6 Micro-copy (FR)
- « Le consentement parental est obligatoire pour créer un profil d'élève mineur. »
- « Confirmer l'anonymisation ? Cette action est irréversible. »
- « Vos données sont conservées 3 ans après la fin de l'adhésion. »

## 6. Spécification technique

### 6.1 Fichiers (nouveaux / modifiés)
- Modifiés : `src/collections/Eleves/index.ts` (champs consentement + rétention, validations), `src/collections/Alertes` (nouveau type `rgpd-retention`).
- Nouveaux : `src/globals/PolitiqueRgpd/index.ts` (global versionné), `src/app/(site)/rgpd/page.tsx`, `src/utilities/rgpd/` (`exporterEleve`, `anonymiserEleve`, `verifierRetention`), endpoint admin `src/app/api/rgpd/export/[eleveId]/route.ts`.
- Cron (Spec 05) : étendre `detecterAlertes` avec `detecterFinRetention`.

### 6.2 Données & persistance
- Champs ajoutés sur `eleves` : `consentementRGPD`, `dateConsentement`, `versionConsentement`, `quiAConsenti`, `dateFinAdhesion`, `consentementRetire` (checkbox).
- Global `politiqueRgpd` : `version` (text), `datePublication` (date), `contenu` (richText).
- Anonymisation : update transactionnel sur les collections concernées.

### 6.3 API / contraintes
- Export : admin only, JSON brut (pas d'overrideAccess sur les collections, requêtes ciblées).
- Le cron de rétention n'alerte que, ne purge jamais seul (décision humaine — cf. 4.2).
- Journal d'anonymisation : log serveur structuré + alerte `traitee` avec résolution « anonymisé par {admin} le {date} ».

## 7. Critères d'acceptation
- [ ] Créer un élève mineur sans consentement est impossible (message FR).
- [ ] Un élève majeur peut être créé avec consentement « l'élève » sans parent.
- [ ] La version de la politique est enregistrée avec le consentement.
- [ ] La page `/rgpd` est publique et affiche la politique courante (version + date).
- [ ] Renseigner `dateFinAdhesion` + 3 ans fait apparaître une alerte `rgpd-retention` au prochain cron.
- [ ] Le cron ne supprime jamais rien lui-même.
- [ ] « Exporter les données » télécharge un JSON complet de l'élève.
- [ ] « Anonymiser » rend l'élève non identifiable (nom, naissance, commentaires) tout en conservant les stats de présence ; action journalisée.
- [ ] Lint, typecheck, tests (validations + anonymisation) passent.

## 8. Risques & questions ouvertes
- Durée de rétention : 3 ans est une proposition commune (données de contact : 3 ans du dernier contact ; documents pédagogiques : durée de la relation + 3 ans) — à valider avec l'asso et sa politique papier.
- L'anonymisation des retours richText (lexical JSON) : il faut parcourir le texte pour remplacer le nom — coût faible mais implémentation non triviale ; alternative : anonymiser seulement les métadonnées et marquer les retours « archivés » (invisibles). Décision à affiner à l'implémentation.
- Sous-traitants : Vercel, Neon (sous-traitance art. 28) — l'asso doit les lister dans sa politique ; fournir un brouillon dans la seed de `/rgpd`.
- Mineurs < 15 ans : le consentement parental est la base légale retenue — noter dans la politique que l'intérêt légitime/opposition s'applique aussi.
- Un enfant avec deux parents liés : un seul consentement suffit ? Oui, un des titulaires de l'autorité parentale suffit, mais tracer lequel.
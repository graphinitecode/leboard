# Spec 08 — Rapports périodiques

> **Statut** : Proposé · **Priorité** : Moyenne · **Effort** : M · **Dépendances** : Spec 01, Spec 03, Spec 04

## 1. Objectif
Générer à la demande, par élève et sur une période donnée, un bilan synthétique (présence, progression, retours) — consultable en HTML, imprimable en PDF — pour les bilans de fin de trimestre avec les familles et les dossiers de subvention.

## 2. Valeur utilisateur
- Gain de temps énorme : le bilan trimestriel se construit en un clic au lieu de ressasser les données à la main.
- Document prêt à l'emploi : réunion famille, dossier subvention (justification d'activité chiffrée), réunion du bureau.
- Cohérence : le même calcul pour tous les élèves, reproductible d'un trimestre à l'autre.

## 3. Périmètre
- **Inclus** :
  - Page admin `/admin/rapports` (ou collection `rapports` générée à la volée) : choix élève + période → rapport HTML.
  - Calculs : taux de présence (présentes / attendues), nombre d'absences justifiées/non, liste des progressions (par matière, évolution des niveaux), extraits des retours de séance, prêts ouverts.
  - Impression : CSS print propre (le PDF se fait via « Imprimer → PDF » du navigateur — pas de lib PDF en v1).
  - Rapport d'ensemble (facultatif, v1 inclus si simple) : stats globales sur la période (inscriptions, taux de présence moyen, nombre de prêts) pour le bureau.
- **Exclu** (pour cette itération) :
  - Envoi automatique du rapport aux parents (portail Spec 06 les couvre).
  - Génération par cron / envoi d'emails.
  - Archivage signé / versions immuables.
  - Graphiques élaborés (des tableaux + badges suffisent).

## 4. Spécification fonctionnelle

### 4.1 Paramètres
- `eleve` (relation), `periodeDebut`, `periodeFin` (dates, défaut : trimestre courant).
- Option `inclureRetours` (défaut oui) et `inclurePrets` (défaut oui) pour alléger un rapport.

### 4.2 Contenu du rapport élève
1. **En-tête** : nom, prénom, niveau, groupe, période, prof référent, date de génération.
2. **Présences** : X séances attendues, Y présentes, Z absences (dont W justifiées), taux = Y/X. Détail ligne par ligne (date, matière, statut).
3. **Progressions** : regroupées par matière, chronologiques ; synthèse des niveaux (acquis/en-cours/à revoir) ; les commentaires des profs sont inclus (utile au bilan).
4. **Retours de séance** : liste chronologique, rendu lexical→HTML.
5. **Prêts** : ouverts d'abord (avec retard signalé), puis retournés sur la période.

### 4.3 Règles
- Le taux de présence se calcule sur les séances **du groupe de l'élève** dans la période (les séances auxquelles il était attendu), pas sur toutes les séances de l'asso.
- Période vide (aucune séance) : le rapport s'affiche avec les sections « aucune donnée sur la période » — pas d'erreur.
- Accès : admin et prof référent de l'élève ; parent : pas d'accès (il a le portail ; le rapport imprimé lui sera remis par l'asso si besoin).

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- Route dédiée dans l'admin (custom view) : `/admin/rapports` — ou, plus simple en v1, une page publique protégée `/rapports` accessible aux sessions admin/prof. Décision v1 : page hors admin (plus simple à imprimer), lien depuis le dashboard admin.

### 5.2 Disposition (wireframe)
```
┌ Rapport élève ────────────────────────────────────────────┐
│ [Élève ▾] [du 01/09/2026] [au 31/12/2026] [Générer] [🖨]    │
├───────────────────────────────────────────────────────────┤
│ LÉA MARTIN — 4e — Groupe Maths-3e — Référent : J. Dupont   │
│ Période : 01/09 → 31/12/2026 · généré le 18/09             │
│                                                           │
│ Présence : 86 % (12/14) · 2 absences (1 justifiée)         │
│ Progressions — Maths : Tables [acquis] · Division [en cours]│
│ Retours de séance : (12/09) … / (05/09) …                  │
│ Prêts : Sésamath 4e (retour prévu 25/09)                   │
└───────────────────────────────────────────────────────────┘
```

### 5.3 États & interactions
- Bouton « Générer » désactivé tant qu'élève/période incomplets.
- Générer → skeleton de chargement puis rapport ; régénérable à volonté (pas de stockage : calculé à la demande).

### 5.4 Responsive
- Le rapport s'affiche sur mobile mais est conçu pour l'impression A4 (portrait).

### 5.5 Thème clair/sombre & accessibilité
- `@media print` : fond blanc forcé, en-tête compact, sauts de page entre sections. Le thème sombre n'affecte pas l'impression.

### 5.6 Micro-copy (FR)
- « Générer le rapport », « Aucune séance sur cette période. », « Taux de présence », « Généré le {date} — document interne LPV ».

## 6. Spécification technique

### 6.1 Fichiers (nouveaux / modifiés)
- Nouveaux : `src/app/(site)/rapports/page.tsx` (form + rendu), `src/utilities/rapports/` (`calculerStats`, `construireRapportEleve`), CSS print `rapports.css`.
- Access : session admin/prof (cf. 4.3) — réutiliser helpers Spec 02.

### 6.2 Données & persistance
- Aucune persistance : génération à la volée depuis `presences`, `progressions`, `seances`, `prets` (Local API). Avantage : toujours à jour, zéro stockage redondant.
- Si plus tard un archivage est voulu (envoi aux financeurs), collection `rapports` snapshot — hors v1.

### 6.3 API / contraintes
- Server component lisant la Local API avec Where clauses (période + groupe de l'élève).
- Vérification d'accès : admin, ou prof = `profReferent` de l'élève.
- Performance : volumes faibles ; requêtes par élève OK.

## 7. Critères d'acceptation
- [ ] Un admin génère un rapport élève sur une période : taux de présence correct (vérifié à la main sur des données de test).
- [ ] Les absences justifiées sont comptées séparément.
- [ ] Les progressions sont groupées par matière, chronologiques, avec commentaires.
- [ ] Les retours de séance de la période apparaissent, rendus en HTML.
- [ ] Un prof référent peut générer le rapport de son élève ; pas ceux des autres.
- [ ] Un parent ne peut pas accéder à `/rapports` (403/redirect login).
- [ ] Le rendu imprimé (Ctrl+P) est propre : en-tête, pagination, pas de fond sombre.
- [ ] Période sans données → sections vides explicites, pas d'erreur 500.
- [ ] Lint, typecheck, tests (calculs de stats) passent.

## 8. Risques & questions ouvertes
- Définition du « trimestre » par défaut : simple plage 90 jours ou aligné sur les vacances ? En v1 : l'admin choisit librement les dates (les trimestres de l'asso peuvent ne pas correspondre aux dates scolaires officielles).
- Export CSV pour le bureau (stats globales annuelles) : possible en v2 ; le rapport d'ensemble HTML imprimable couvre déjà l'essentiel.
- Mention RGPD sur le rapport (données de mineurs) : pied de page « Document interne — ne pas diffuser » (cf. Spec 09).
- Faut-il y inclure les alertes décrochage de la période ? Non : le rapport raconte le suivi positif ; les alertes sont gérées à part (Spec 05).
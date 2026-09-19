import type { Metadata } from 'next'

import { Bouton, BackLink, FilAriane, InsetText, Panel, Tag, TexteAvertissement, Details, Televersement } from '@/components/atoms'
import { Label, Hint, ErrorMessage } from '@/components/atoms/Champ'
import { Accordeon, BoutonsRadio, CasesACocher, ChampDate, ChampEnsemble, ChampFormulaire, CompteurCaracteres, ListeTaches, Modale, NotificationBanner, Onglets, PaginationLPV, ResumeErreurs, SummaryList, Tableau, Toast, BasculeTheme } from '@/components/molecules'
import type { SectionAccordeon, Onglet, OptionCase, OptionRadio, TableauHeadCell, TableauRowCell, Tache, PageNumero } from '@/components/molecules'

import { DemoModale, DemoToggle, DemoToast } from './DemoClient'

import '../lpvboard.css'

export const metadata: Metadata = {
  title: 'Design system — LPV Board',
  robots: { index: false, follow: false },
}

const ACCORDEON_SECTIONS: SectionAccordeon[] = [
  { titre: 'Section un', resume: 'Résumé de la section un', contenu: <p>Contenu détaillé de la première section.</p> },
  { titre: 'Section deux', contenu: <p>Contenu de la deuxième section, sans résumé.</p> },
  { titre: 'Section trois', resume: 'Résumé court', contenu: <p>Et un troisième contenu.</p> },
]

const ONGLETS: Onglet[] = [
  { id: 'lundi', libelle: 'Lundi', contenu: <p>Cours de mathématiques le lundi.</p> },
  { id: 'mardi', libelle: 'Mardi', contenu: <p>Cours de français le mardi.</p> },
  { id: 'mercredi', libelle: 'Mercredi', contenu: <p>Pas de cours le mercredi.</p> },
]

const CASES_OPTIONS: OptionCase[] = [
  { valeur: 'email', texte: 'Notification par e-mail' },
  { valeur: 'sms', texte: 'Notification par SMS', hint: 'Des frais peuvent s\'appliquer.' },
  { valeur: 'courrier', texte: 'Notification par courrier' },
  { diviseur: 'ou' },
  { valeur: 'aucun', texte: 'Aucune notification' },
]

const RADIO_OPTIONS: OptionRadio[] = [
  { valeur: 'oui', texte: 'Oui', conditionnel: <ChampFormulaire hint="Précisez les modalités." id="modalites" label="Modalités" optionnel /> },
  { valeur: 'non', texte: 'Non' },
]

const TABLEAU_HEAD: TableauHeadCell[] = [
  { texte: 'Nom' },
  { texte: 'Niveau', format: 'numerique' },
  { texte: 'Statut' },
]

const TABLEAU_ROWS: TableauRowCell[][] = [
  [{ texte: 'Alice' }, { texte: '6e', format: 'numerique' }, { contenu: <Tag couleur="vert">Présent</Tag> }],
  [{ texte: 'Bob' }, { texte: '5e', format: 'numerique' }, { contenu: <Tag couleur="rouge">Absent</Tag> }],
  [{ texte: 'Clara' }, { texte: '4e', format: 'numerique' }, { contenu: <Tag couleur="jaune">Absent (justifié)</Tag> }],
]

const TACHES: Tache[] = [
  { titre: 'Inscription élève', href: '#', hint: 'À compléter avant le 15 septembre', statut: { texte: 'À faire', couleur: 'orange' } },
  { titre: 'Consentement RGPD', href: '#', statut: { texte: 'Fait', couleur: 'vert' } },
  { titre: 'Certificat médical', statut: { texte: 'En attente', couleur: 'jaune' } },
]

const PAGES: (PageNumero | { ellipsis: true })[] = [
  { numero: 1, href: '#' },
  { ellipsis: true },
  { numero: 6, href: '#' },
  { numero: 7, href: '#', courant: true },
  { numero: 8, href: '#' },
  { ellipsis: true },
  { numero: 42, href: '#' },
]

const PAGES_COURTE: (PageNumero | { ellipsis: true })[] = [
  { numero: 1, href: '#' },
  { numero: 2, href: '#', courant: true },
  { numero: 3, href: '#' },
]

const PAGES_PREMIERE: (PageNumero | { ellipsis: true })[] = [
  { numero: 1, href: '#', courant: true },
  { numero: 2, href: '#' },
  { numero: 3, href: '#' },
]

const PAGES_DERNIERE: (PageNumero | { ellipsis: true })[] = [
  { numero: 1, href: '#' },
  { numero: 2, href: '#' },
  { numero: 3, href: '#', courant: true },
]

export default function DesignSystemPage() {
  return (
    <div className="lpv-container" style={{ paddingBottom: '4rem' }}>
      <h1 className="lpv-h1">Design system LPV Board</h1>
      <p className="lpv-muted">
        Composants inspirés du GOV.UK Design System, adaptés aux couleurs et aux conventions LPV.
      </p>

      <nav aria-label="Sommaire" style={{ marginBottom: '2rem' }}>
        <FilAriane
          liens={[
            { href: '#boutons', libelle: 'Boutons' },
            { href: '#tags', libelle: 'Tags & toggle' },
            { href: '#messages', libelle: 'Messages' },
            { href: '#navigation', libelle: 'Navigation' },
            { href: '#formulaires', libelle: 'Formulaires' },
            { href: '#donnees', libelle: 'Données' },
            { href: '#surfaces', libelle: 'Surfaces' },
          ]}
        />
      </nav>

      <section id="boutons" style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Boutons</h2>
        <div className="lpv-demo-exemples">
          <Bouton type="button">Primaire</Bouton>
          <Bouton type="button" variante="secondaire">Secondaire</Bouton>
          <Bouton type="button" variante="avertissement">Avertissement</Bouton>
          <Bouton type="button" variante="danger">Danger</Bouton>
          <Bouton href="/design-system" type="button">Lien primaire</Bouton>
        </div>
      </section>

      <section id="tags" style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Tags & toggle</h2>
        <div className="lpv-demo-exemples">
          <Tag couleur="vert">Actif</Tag>
          <Tag couleur="jaune">En attente</Tag>
          <Tag couleur="orange">À faire</Tag>
          <Tag couleur="rouge">Urgent</Tag>
          <Tag couleur="bleu">Info</Tag>
        </div>
        <h3 className="lpv-h3" style={{ marginTop: '1rem' }}>Toggle segmenté</h3>
        <DemoToggle />
      </section>

      <section id="messages" style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Messages</h2>

        <h3 className="lpv-h3">InsetText</h3>
        <InsetText>Ce texte met en évidence une information importante pour l&apos;utilisateur.</InsetText>

        <h3 className="lpv-h3">Panel</h3>
        <Panel>Les cours du mercredi sont annulés pendant les vacances scolaires.</Panel>

        <h3 className="lpv-h3">TexteAvertissement</h3>
        <TexteAvertissement>Cette action est irréversible. Vérifiez les informations avant de continuer.</TexteAvertissement>

        <h3 className="lpv-h3">NotificationBanner</h3>
        <NotificationBanner titre="Vos disponibilités ont été enregistrées" type="succes" />

        <h3 className="lpv-h3">ResumeErreurs</h3>
        <ResumeErreurs erreurs={[
          { champId: 'nom', texte: 'Le nom est requis' },
          { champId: 'email', texte: 'L\'adresse e-mail n\'est pas valide' },
        ]} />

        <h3 className="lpv-h3">Toast</h3>
        <DemoToast />
      </section>

      <section id="navigation" style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Navigation</h2>

        <h3 className="lpv-h3">BackLink</h3>
        <BackLink href="/profs">Tableau de bord</BackLink>

        <h3 className="lpv-h3">FilAriane</h3>
        <FilAriane liens={[
          { href: '/', libelle: 'Accueil' },
          { href: '/profs', libelle: 'Espace profs' },
          { libelle: 'Disponibilités' },
        ]} />

        <h3 className="lpv-h3">Pagination</h3>
        <p className="lpv-muted" style={{ marginTop: 0 }}>
          La page courante est un bloc plein inversé, non cliquable. « Précédent » n&apos;est
          pas rendu en première page, « Suivant » en dernière page.
        </p>
        <PaginationLPV items={PAGES} precedente={{ href: '#' }} suivante={{ href: '#' }} />
        <PaginationLPV items={PAGES_COURTE} precedente={{ href: '#' }} suivante={{ href: '#' }} />
        <PaginationLPV items={PAGES_PREMIERE} suivante={{ href: '#' }} />
        <PaginationLPV items={PAGES_DERNIERE} precedente={{ href: '#' }} />
        <PaginationLPV items={PAGES} precedente={{ href: '#', libelle: 'Disponibilités' }} suivante={{ href: '#', libelle: 'Élèves' }} variante="bloc" />

        <h3 className="lpv-h3">Details</h3>
        <Details resume="Quelles sont les horaires possibles ?" open>
          Les cours ont lieu du lundi au samedi, de 8h à 18h.
        </Details>
        <Details resume="Comment s&apos;inscrire ?">
          Contactez l&apos;association par e-mail ou via le formulaire en ligne.
        </Details>

        <h3 className="lpv-h3">Accordeon</h3>
        <Accordeon id="demo-accordeon" sections={ACCORDEON_SECTIONS} />

        <h3 className="lpv-h3">Onglets</h3>
        <Onglets id="demo-onglets" onglets={ONGLETS} titre="Cours par jour" />
      </section>

      <section id="formulaires" style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Formulaires</h2>

        <h3 className="lpv-h3">Label tailles & isPageHeading</h3>
        <div style={{ marginBottom: '1rem' }}>
          <Label htmlFor="demo-label-l" taille="l">Label taille L</Label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Label htmlFor="demo-label-m" taille="m">Label taille M</Label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Label htmlFor="demo-label-s" taille="s">Label taille S</Label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Label htmlFor="demo-label-heading" isPageHeading>Label comme titre de page</Label>
        </div>

        <h3 className="lpv-h3">ChampFormulaire</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <ChampFormulaire hint="Par exemple : Dupont, Martin." id="demo-champ-nom" label="Nom complet" />
        </div>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <ChampFormulaire erreur="Entrez votre adresse e-mail" hint="Nous ne partagerons pas votre e-mail." id="demo-champ-email" label="Adresse e-mail" type="email" />
        </div>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <ChampFormulaire id="demo-champ-opt" label="Téléphone" optionnel />
        </div>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <ChampFormulaire as="textarea" hint="Décrivez votre situation en quelques phrases." id="demo-champ-textarea" label="Description" rows={4} />
        </div>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <ChampFormulaire as="select" id="demo-champ-select" label="Niveau" options={[{ label: '6e', value: '6e' }, { label: '5e', value: '5e' }, { label: '4e', value: '4e' }]} />
        </div>

        <h3 className="lpv-h3">ChampDate</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <ChampDate hint="Par exemple : 15 03 2025" id="demo-date" label="Date de naissance" />
        </div>

        <h3 className="lpv-h3">ChampEnsemble (fieldset)</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <ChampEnsemble erreur="Choisissez une option" hint="Sélectionnez la fréquence souhaitée." isPageHeading legende="Fréquence des rappels" taille="m">
            <ChampFormulaire as="select" id="demo-ensemble-freq" label="Fréquence" options={[{ label: 'Quotidien', value: 'quotidien' }, { label: 'Hebdomadaire', value: 'hebdomadaire' }]} />
          </ChampEnsemble>
        </div>

        <h3 className="lpv-h3">CasesACocher</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <CasesACocher hint="Vous pouvez choisir plusieurs options." idPrefix="demo-cases" nom="notifications" options={CASES_OPTIONS} />
        </div>

        <h3 className="lpv-h3">BoutonsRadio</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <BoutonsRadio idPrefix="demo-radio" nom="accord" options={RADIO_OPTIONS} valeur="non" />
        </div>

        <h3 className="lpv-h3">CompteurCaracteres</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <CompteurCaracteres hint="Décrivez votre situation en quelques mots." id="demo-compteur" label="Description" limite={200} name="description" />
        </div>

        <h3 className="lpv-h3">Televersement</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <Televersement accept=".pdf,.jpg,.png" hint="Formats acceptés : PDF, JPG, PNG." id="demo-upload" label="Attestation" name="attestation" optionnel />
        </div>

        <h3 className="lpv-h3">Mot de passe</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <ChampFormulaire
            autoComplete="current-password"
            hint="8 caractères minimum."
            id="demo-champ-password"
            label="Mot de passe"
            type="password"
          />
        </div>
      </section>

      <section id="donnees" style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Données</h2>

        <h3 className="lpv-h3">Tableau</h3>
        <Tableau
          caption="Élèves inscrits"
          captionTaille="l"
          head={TABLEAU_HEAD}
          premiereCelluleEntete
          rows={TABLEAU_ROWS}
        />

        <h3 className="lpv-h3">ListeTaches</h3>
        <ListeTaches idPrefix="demo-tache" taches={TACHES} />

        <h3 className="lpv-h3">SummaryList</h3>
        <SummaryList
          items={[
            { cle: 'Nom', valeur: 'Dupont' },
            { cle: 'Prénom', valeur: 'Marie' },
            { cle: 'Niveau', valeur: '6e' },
          ]}
        />

        <h3 className="lpv-h3">SummaryList avec actions</h3>
        <p className="lpv-muted" style={{ marginTop: 0 }}>
          Une action par row (Modifier), plusieurs actions séparées par un trait vertical
          (Ajouter | Modifier | Supprimer). Le rouge est réservé à l&apos;action destructive.
          Une valeur manquante se présente comme un lien « Renseigner… » dans la colonne valeur.
        </p>
        <SummaryList
          items={[
            {
              cle: 'Élève',
              valeur: 'Marie Dupont',
              actions: [<a href="#modifier" key="mod">Modifier</a>],
            },
            {
              cle: 'Adresse',
              valeur: (
                <>
                  12 rue des Lilas
                  <br />
                  75011 Paris
                </>
              ),
              actions: [<a href="#modifier" key="mod">Modifier</a>],
            },
            {
              cle: 'Créneau',
              valeur: 'Lundi 14h → 16h',
              actions: [
                <a href="#ajouter" key="aj">Ajouter</a>,
                <a href="#modifier" key="mod">Modifier</a>,
                <a className="lpv-action--danger" href="#supprimer" key="sup">Supprimer</a>,
              ],
            },
            {
              cle: 'Certificat médical',
              valeur: <a href="#renseigner">Renseigner…</a>,
            },
          ]}
        />
      </section>

      <section id="surfaces" style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Surfaces</h2>

        <h3 className="lpv-h3">Bascule de thème</h3>
        <p className="lpv-muted" style={{ marginTop: 0 }}>
          Le mode sombre s&apos;applique à tout le design system via <code>data-theme</code> sur
          {' '}<code>&lt;html&gt;</code>. Le choix est mémorisé (localStorage) et suit
          {' '}<code>prefers-color-scheme</code> par défaut.
        </p>
        <div className="lpv-card" style={{ alignItems: 'center', display: 'flex', gap: '1rem', justifyContent: 'space-between', maxWidth: '28rem' }}>
          <span>Thème actuel</span>
          <BasculeTheme />
        </div>

        <h3 className="lpv-h3">Modale</h3>
        <DemoModale />

        <h3 className="lpv-h3">Récapitulatif (markup statique)</h3>
        <div className="lpv-recap" style={{ marginBottom: '1rem' }}>
          <div className="lpv-recap__ligne">
            <span className="lpv-recap__cle">Jour</span>
            <span>Lundi</span>
          </div>
          <div className="lpv-recap__ligne">
            <span className="lpv-recap__cle">Heure</span>
            <span>14h → 16h</span>
          </div>
        </div>

        <h3 className="lpv-h3">Stepper (markup statique)</h3>
        <p className="lpv-stepper__etape">Étape 1 sur 3</p>
        <h2 className="lpv-stepper__question">Quel jour vous convient ?</h2>
        <p className="lpv-stepper__hint">Sélectionnez un jour de la semaine.</p>
      </section>
    </div>
  )
}
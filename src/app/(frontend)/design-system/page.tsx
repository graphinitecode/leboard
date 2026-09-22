import type { Metadata } from 'next'

import { Button, BackLink, Breadcrumbs, Icon, InsetText, Panel, Tag, WarningText, Details, FileUpload } from '@/components/atoms'
import { Label } from '@/components/atoms/a-label'
import { Accordion, Avatar, Checkbox, DateInput, InputField, Input, CharacterCount, TaskList, NotificationBanner, Tabs, Pagination, ErrorSummary, SummaryList, Table, ThemeToggle } from '@/components/molecules'
import type { AccordionSection, Tab, CheckboxOption, TableHeadCell, TableRowCell, Task, PageNumber } from '@/components/molecules'

import { DemoModale, DemoRadio, DemoToggle, DemoToast } from './DemoClient'

import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Design system — LPV Board',
  robots: { index: false, follow: false },
}

const ACCORDION_SECTIONS: AccordionSection[] = [
  { title: 'Section un', summary: 'Résumé de la section un', content: <p>Contenu détaillé de la première section.</p> },
  { title: 'Section deux', content: <p>Contenu de la deuxième section, sans résumé.</p> },
  { title: 'Section trois', summary: 'Résumé court', content: <p>Et un troisième contenu.</p> },
]

const TABS: Tab[] = [
  {
    id: 'lundi',
    label: 'Lundi',
    content: (
      <p>
        Cours de <strong>mathématiques</strong> le lundi.
      </p>
    ),
  },
  {
    id: 'mardi',
    label: 'Mardi',
    content: (
      <p>
        Cours de{' '}
        <strong>
          <Link href="/design-system">français</Link>
        </strong>{' '}
        le mardi.
      </p>
    ),
  },
  { id: 'mercredi', label: 'Mercredi', content: <p>Pas de cours le mercredi.</p> },
]

const CHECKBOX_OPTIONS: CheckboxOption[] = [
  { value: 'email', label: 'Notification par e-mail' },
  { value: 'sms', label: 'Notification par SMS', hint: 'Des frais peuvent s\'appliquer.' },
  { value: 'courrier', label: 'Notification par courrier' },
  { divider: 'ou' },
  { value: 'none', label: 'Aucune notification' },
]

const TABLE_HEAD: TableHeadCell[] = [
  { text: 'Nom' },
  { text: 'Niveau', format: 'numeric' },
  { text: 'Statut' },
]

const TABLE_ROWS: TableRowCell[][] = [
  [{ text: 'Alice' }, { text: '6e', format: 'numeric' }, { content: <Tag color="green">Présent</Tag> }],
  [{ text: 'Bob' }, { text: '5e', format: 'numeric' }, { content: <Tag color="red">Absent</Tag> }],
  [{ text: 'Clara' }, { text: '4e', format: 'numeric' }, { content: <Tag color="yellow">Absent (justifié)</Tag> }],
]

const TASKS: Task[] = [
  { title: 'Inscription élève', href: '#', hint: 'À compléter avant le 15 septembre', status: { text: 'À faire', color: 'orange' } },
  { title: 'Consentement RGPD', href: '#', status: { text: 'Fait', color: 'green' } },
  { title: 'Certificat médical', status: { text: 'En attente', color: 'yellow' } },
]

const PAGES: (PageNumber | { ellipsis: true })[] = [
  { number: 1, href: '#' },
  { ellipsis: true },
  { number: 6, href: '#' },
  { number: 7, href: '#', current: true },
  { number: 8, href: '#' },
  { ellipsis: true },
  { number: 42, href: '#' },
]

const PAGES_SHORT: (PageNumber | { ellipsis: true })[] = [
  { number: 1, href: '#' },
  { number: 2, href: '#', current: true },
  { number: 3, href: '#' },
]

const PAGES_FIRST: (PageNumber | { ellipsis: true })[] = [
  { number: 1, href: '#', current: true },
  { number: 2, href: '#' },
  { number: 3, href: '#' },
]

const PAGES_LAST: (PageNumber | { ellipsis: true })[] = [
  { number: 1, href: '#' },
  { number: 2, href: '#' },
  { number: 3, href: '#', current: true },
]

export default function DesignSystemPage() {
  return (
    <div className="lpv-container">
      <h1 className="lpv-h1">Design system</h1>
      <p className="lpv-muted">
        Composants inspirés du GOV.UK Design System, adaptés aux couleurs et aux conventions LPV.
      </p>

      <nav aria-label="Sommaire" style={{ marginBottom: '2rem' }}>
        <Breadcrumbs
          items={[
            { href: '#buttons', label: 'Boutons' },
            { href: '#tags', label: 'Tags & toggle' },
            { href: '#messages', label: 'Messages' },
            { href: '#navigation', label: 'Navigation' },
            { href: '#forms', label: 'Formulaires' },
            { href: '#data', label: 'Données' },
            { href: '#surfaces', label: 'Surfaces' },
            { href: '/design-system/colors', label: 'Couleurs' },
          ]}
        />
      </nav>

      <section id="buttons" style={{ marginBottom: '3.7rem' }}>
        <h2 className="lpv-h2">Boutons</h2>
        <div className="lpv-demo-examples">
          <Button type="button">Primaire</Button>
          <Button type="button" variant="secondary">
            Secondaire
          </Button>
          <Button type="button" variant="success">
            Succès
          </Button>
          <Button type="button" variant="warning">
            Avertissement
          </Button>
          <Button type="button" variant="danger">
            Danger
          </Button>
          <Button href="/design-system" type="button">
            Lien primaire
          </Button>
        </div>
      </section>

      <section id="tags" style={{ marginBottom: '3.7rem' }}>
        <h2 className="lpv-h2">Tags & toggle</h2>
        <div className="lpv-demo-examples">
          <Tag color="green">Actif</Tag>
          <Tag color="yellow">En attente</Tag>
          <Tag color="orange">À faire</Tag>
          <Tag color="red">Urgent</Tag>
          <Tag color="blue">Info</Tag>
          <Tag color="violet">Réservé</Tag>
          <Tag color="magenta">Nouveau</Tag>
          <Tag color="teal">Archivé</Tag>
        </div>
        <h3 className="lpv-h3">Toggle segmenté</h3>
        <DemoToggle />
      </section>

      <section id="messages" style={{ marginBottom: '3.7rem' }}>
        <h2 className="lpv-h2">Messages</h2>

        <h3 className="lpv-h3">InsetText</h3>
        <InsetText>
          Ce texte met en évidence une information importante pour l&apos;utilisateur.
        </InsetText>

        <h3 className="lpv-h3">Panel</h3>
        <Panel>Les cours du mercredi sont annulés pendant les vacances scolaires.</Panel>

        <h3 className="lpv-h3">TexteAvertissement</h3>
        <WarningText>
          Cette action est irréversible. Vérifiez les informations avant de continuer.
        </WarningText>

        <h3 className="lpv-h3">NotificationBanner</h3>
        <NotificationBanner title="Vos disponibilités ont été enregistrées" type="success" />

        <h3 className="lpv-h3">ErrorSummary</h3>
        <ErrorSummary
          errors={[
            { fieldId: 'nom', text: 'Le nom est requis' },
            { fieldId: 'email', text: "L'adresse e-mail n'est pas valide" },
          ]}
        />

        <h3 className="lpv-h3">Toast</h3>
        <DemoToast />
      </section>

      <section id="navigation" style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Navigation</h2>

        <h3 className="lpv-h3">BackLink</h3>
        <BackLink href="/profs">Tableau de bord</BackLink>

        <h3 className="lpv-h3">FilAriane</h3>
        <Breadcrumbs
          items={[
            { href: '/', label: 'Accueil' },
            { href: '/profs', label: 'Mes séances' },
            { label: 'Disponibilités' },
          ]}
        />

        <h3 className="lpv-h3">Pagination</h3>
        <p className="lpv-muted">
          La page courante est un bloc plein inversé, non cliquable. « Précédent » n&apos;est pas
          rendu en première page, « Suivant » en dernière page.
        </p>
        <Pagination items={PAGES} previous={{ href: '#' }} next={{ href: '#' }} />
        <Pagination items={PAGES_SHORT} previous={{ href: '#' }} next={{ href: '#' }} />
        <Pagination items={PAGES_FIRST} next={{ href: '#' }} />
        <Pagination items={PAGES_LAST} previous={{ href: '#' }} />
        <Pagination
          items={PAGES}
          previous={{ href: '#', label: 'Disponibilités' }}
          next={{ href: '#', label: 'Élèves' }}
          variant="block"
        />

        <h3 className="lpv-h3">Details</h3>
        <Details summary="Quelles sont les horaires possibles ?" open>
          Les cours ont lieu du lundi au samedi, de 8h à 18h.
        </Details>
        <Details summary="Comment s'inscrire ?">
          Contactez l&apos;association par e-mail ou via le formulaire en ligne.
        </Details>

        <h3 className="lpv-h3">Accordeon</h3>
        <Accordion id="demo-accordion" sections={ACCORDION_SECTIONS} />

        <h3 className="lpv-h3">Onglets</h3>
        <Tabs id="demo-tabs" tabs={TABS} title="Cours par jour" />
      </section>

      <section id="formulaires" style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Formulaires</h2>

        <h3 className="lpv-h3">Label tailles & isPageHeading</h3>
        <div>
          <Label htmlFor="demo-label-l" size="l">
            Label taille L
          </Label>
        </div>
        <div>
          <Label htmlFor="demo-label-m" size="m">
            Label taille M
          </Label>
        </div>
        <div>
          <Label htmlFor="demo-label-s" size="s">
            Label taille S
          </Label>
        </div>
        <div>
          <Label htmlFor="demo-label-heading" isPageHeading>
            Label comme titre de page
          </Label>
        </div>

        <h3 className="lpv-h3">Input</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <Input
            hint="Par exemple : Dupont, Martin."
            id="demo-champ-nom"
            label="Nom complet"
          />
        </div>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <Input
            error="Entrez votre adresse e-mail"
            hint="Nous ne partagerons pas votre e-mail."
            id="demo-champ-email"
            label="Adresse e-mail"
            type="email"
          />
        </div>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <Input id="demo-champ-opt" label="Téléphone" optional />
        </div>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <Input
            as="textarea"
            hint="Décrivez votre situation en quelques phrases."
            id="demo-champ-textarea"
            label="Description"
            rows={4}
          />
        </div>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <Input
            as="select"
            id="demo-champ-select"
            label="Niveau"
            options={[
              { label: '6e', value: '6e' },
              { label: '5e', value: '5e' },
              { label: '4e', value: '4e' },
            ]}
          />
        </div>

        <h3 className="lpv-h3">ChampDate</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <DateInput hint="Par exemple : 15 03 2025" id="demo-date" label="Date de naissance" />
        </div>

        <h3 className="lpv-h3">ChampEnsemble (fieldset)</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <InputField
            error="Choisissez une option"
            hint="Sélectionnez la fréquence souhaitée."
            isPageHeading
            legend="Fréquence des rappels"
            size="m"
          >
            <Input
              as="select"
              id="demo-ensemble-freq"
              label="Fréquence"
              options={[
                { label: 'Quotidien', value: 'quotidien' },
                { label: 'Hebdomadaire', value: 'hebdomadaire' },
              ]}
            />
          </InputField>
        </div>

        <h3 className="lpv-h3">CasesACocher</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <Checkbox
            hint="Vous pouvez choisir plusieurs options."
            idPrefix="demo-cases"
            name="notifications"
            options={CHECKBOX_OPTIONS}
          />
        </div>

        <h3 className="lpv-h3">BoutonsRadio</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <DemoRadio />
        </div>

        <h3 className="lpv-h3">CompteurCaracteres</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <CharacterCount
            hint="Décrivez votre situation en quelques mots."
            id="demo-compteur"
            label="Description"
            limit={200}
            name="description"
          />
        </div>

        <h3 className="lpv-h3">Televersement</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <FileUpload
            accept=".pdf,.jpg,.png"
            hint="Formats acceptés : PDF, JPG, PNG."
            id="demo-upload"
            label="Attestation"
            name="attestation"
            optional
          />
        </div>

        <h3 className="lpv-h3">Mot de passe</h3>
        <div style={{ marginBottom: '1.5rem', maxWidth: '40rem' }}>
          <Input
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
        <Table
          caption="Élèves inscrits"
          captionSize="l"
          head={TABLE_HEAD}
          firstColumnHeader
          rows={TABLE_ROWS}
        />

        <h3 className="lpv-h3">ListeTaches</h3>
        <TaskList idPrefix="demo-task" tasks={TASKS} />

        <h3 className="lpv-h3">SummaryList</h3>
        <SummaryList
          items={[
            { key: 'Nom', value: 'Dupont' },
            { key: 'Prénom', value: 'Marie' },
            { key: 'Niveau', value: '6e' },
          ]}
        />

        <h3 className="lpv-h3">SummaryList avec actions</h3>
        <p className="lpv-muted" style={{ marginTop: 0 }}>
          Une action par row (Modifier), plusieurs actions séparées par un trait vertical (Ajouter |
          Modifier | Avertir | Supprimer). Le rouge est réservé à l&apos;action destructive,
          l&apos;orange signale une action avec conséquence. Une valeur manquante se présente comme
          un lien « Renseigner… » dans la colonne valeur.
        </p>
        <SummaryList
          items={[
            {
              key: 'Élève',
              value: 'Marie Dupont',
              actions: [{ type: 'normal', label: 'Modifier', href: '#modifier' }],
            },
            {
              key: 'Adresse',
              value: (
                <>
                  12 rue des Lilas
                  <br />
                  75011 Paris
                </>
              ),
              actions: [{ type: 'normal', label: 'Modifier', href: '#modifier' }],
            },
            {
              key: 'Créneau',
              value: 'Lundi 14h → 16h',
              actions: [
                { key: 'aj', label: 'Ajouter', href: '#ajouter' },
                { key: 'mod', label: 'Modifier', href: '#modifier' },
                { key: 'av', label: 'Suspendre', href: '#suspendre', type: 'warning' },
                { key: 'sup', label: 'Supprimer', href: '#supprimer', type: 'danger', confirmation: 'Cette action est définitive' },
              ],
            },
            {
              key: 'Certificat médical',
              value: (
                <a href="#renseigner" className="lpv-link-inline">
                  Renseigner…
                </a>
              ),
            },
          ]}
        />

        <h3 className="lpv-h3">SummaryList sans séparateurs</h3>
        <p className="lpv-muted" style={{ marginTop: 0 }}>
          Avec <code>dividers&#123;=&#123;false&#125;&#125;</code>, les rows s&apos;empilent sans bordure
          et les actions perdent le trait vertical.
        </p>
        <SummaryList
          dividers={false}
          items={[
            { key: 'Nom', value: 'Dupont' },
            { key: 'Prénom', value: 'Marie' },
            { key: 'Niveau', value: '6e' },
          ]}
        />
      </section>

      <section id="surfaces">
        <h2 className="lpv-h2">Surfaces</h2>

        <h3 className="lpv-h3">Avatar utilisateur (entête portail)</h3>
        <p className="lpv-muted">
          Affiché quand une session est active : prénom, cercle d&apos;initiales et chevron,
          séparateur vertical avant le menu. Le panneau déroulant présente l&apos;identité et la
          déconnexion. Se ferme au clic extérieur ou à Escape. En mobile (&lt; 48rem) le prénom
          disparaît et le bouton Menu devient l&apos;icône rivet-icons:menu (close panneau ouvert,
          sections en accordéon).
        </p>
        <div
          className="lpv-card"
          style={{
            alignItems: 'center',
            backgroundColor: 'var(--lpv-portail)',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            maxWidth: '32rem',
          }}
        >
          <Avatar email="olivier.durand@lpv.fr" nom="Olivier Durand" />
          <span aria-hidden="true" className="lpv-o-header__separator" />
          <button aria-expanded={false} className="lpv-m-collapsible-menu__button" type="button">
            <span aria-hidden="true" className="lpv-m-collapsible-menu__button-icon">
              <Icon icon="rivet-icons:menu" size={22} />
            </span>
            <span aria-hidden="true" className="lpv-m-collapsible-menu__button-chevron">
              <Icon icon="rivet-icons:chevron-down" size={22} />
            </span>
            <span className="lpv-m-collapsible-menu__button-label">Menu</span>
          </button>
        </div>

        <h3 className="lpv-h3">Bascule de thème</h3>
        <p className="lpv-muted">
          Le mode sombre s&apos;applique à tout le design system via <code>data-theme</code> sur{' '}
          <code>&lt;html&gt;</code>. Le choix est mémorisé (localStorage) et suit{' '}
          <code>prefers-color-scheme</code> par défaut. Dans l&apos;entête des portails, la
          bascule vit dans le panneau du menu (variante « panneau ») et non plus dans la barre.
        </p>
        <div
          className="lpv-card"
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between',
            maxWidth: '28rem',
          }}
        >
          <span>Thème actuel</span>
          <ThemeToggle />
        </div>

        <h3 className="lpv-h3">Modale</h3>
        <DemoModale />

        <h3 className="lpv-h3">Récapitulatif (markup statique)</h3>
        <div className="lpv-recap" style={{ marginBottom: '1rem' }}>
          <div className="lpv-recap__row">
            <span className="lpv-recap__key">Jour</span>
            <span>Lundi</span>
          </div>
          <div className="lpv-recap__row">
            <span className="lpv-recap__key">Heure</span>
            <span>14h → 16h</span>
          </div>
        </div>

        <h3 className="lpv-h3">Stepper (markup statique)</h3>
        <p className="lpv-stepper__step">Étape 1 sur 3</p>
        <h2 className="lpv-stepper__question">Quel jour vous convient ?</h2>
        <p className="lpv-stepper__hint">Sélectionnez un jour de la semaine.</p>
      </section>
    </div>
  )
}

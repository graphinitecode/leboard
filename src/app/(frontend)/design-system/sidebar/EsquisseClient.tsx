'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Icon } from '@/components/atoms/a-icon'
import { Tag } from '@/components/atoms/a-tag'
import { Avatar } from '@/components/molecules/m-avatar'
import { ThemeToggle } from '@/components/molecules/m-theme-toggle'

/* Maquettes jetables pour l'esquisse « sidebar menu » (/design-system/sidebar).
   Markup volontairement simplifié : pas de composants du design system pour
   la nav (c'est l'objet du débat), composants réels seulement pour Avatar et
   ThemeToggle. Les cadres (.lpv-esq-frame) simulent le viewport via des
   container queries — voir _esquisse-sidebar.scss. À supprimer après arbitrage. */

type ColId = 'legal' | 'services'

type FrameSize = 'desktop' | 'phone'

type FrameVariante = 'a' | 'b' | 'c'

const SERVICES: { href: string; label: string }[] = [
  { href: '#', label: 'Mes séances' },
  { href: '#', label: 'Calendrier' },
  { href: '#', label: 'Mes élèves' },
  { href: '#', label: 'Bibliothèque' },
  { href: '#', label: 'Mes disponibilités' },
  { href: '#', label: 'Espace parents' },
]

const LEGAL: { href: string; label: string }[] = [
  { href: '#', label: 'Mentions légales' },
  { href: '#', label: 'Politique de confidentialité' },
]

const SEANCES = [
  { nom: 'Léa Martin', detail: 'Maths · 4e · Lundi 14h → 16h', tag: 'Présent', color: 'green' as const },
  { nom: 'Karim Bensalem', detail: 'Français · 5e · Mardi 17h → 18h', tag: 'En attente', color: 'yellow' as const },
  { nom: 'Sofia Robert', detail: 'Maths · 3e · Mercredi 10h → 11h', tag: 'Retour à faire', color: 'orange' as const },
  { nom: 'Noëlle Traoré', detail: 'Physique · 6e · Jeudi 15h → 16h', tag: 'Séance planifiée', color: 'blue' as const },
]

function Frame({ children, size, variante }: { children: ReactNode; size: FrameSize; variante: FrameVariante }) {
  return (
    <div className={`lpv-esq-frame${size === 'phone' ? ' lpv-esq-frame--phone' : ''}`} data-esq-variante={variante}>
      <div className="lpv-esq-app">{children}</div>
    </div>
  )
}

// Barre d'entête (bande portail) : logo + actions + panneau éventuel.
// La barre porte position:relative : elle ancre le panneau dépliant.
function Bar({ actions, panel }: { actions: ReactNode; panel?: ReactNode }) {
  return (
    <div className="lpv-esq-bar">
      <a className="lpv-esq-bar__logo" href="#" onClick={(event) => event.preventDefault()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src="/lpv-logo-white.svg" />
        <span className="lpv-esq-bar__logo-text">Les Pierres Vivantes</span>
      </a>
      <div className="lpv-esq-bar__actions">{actions}</div>
      {panel}
    </div>
  )
}

function MenuButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      aria-expanded={open}
      className="lpv-esq-menubtn"
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true" className="lpv-esq-menubtn__icon">
        <Icon icon={open ? 'rivet-icons:close' : 'rivet-icons:menu'} size={22} />
      </span>
      <span className="lpv-esq-menubtn__label">Menu</span>
      <span aria-hidden="true" className="lpv-esq-menubtn__chevron">
        <Icon icon={open ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} size={22} />
      </span>
    </button>
  )
}

// Panneau dépliant simplifié : colonnes accordéon < 41rem (état piloté),
// listes forcément dépliées >= 41rem (chevrons neutralisés par le CSS).
function MenuPanel({
  cols,
  onToggleCol,
}: {
  cols: Set<ColId>
  onToggleCol: (id: ColId) => void
}) {
  function column(id: ColId, title: string, links: { href: string; label: string }[]) {
    const isOpen = cols.has(id)

    return (
      <div className={`lpv-esq-panel__column${isOpen ? ' lpv-esq-panel__column--open' : ''}`}>
        <button
          aria-expanded={isOpen}
          className="lpv-esq-panel__column-title"
          onClick={() => onToggleCol(id)}
          type="button"
        >
          {title}
          <span aria-hidden="true" className="lpv-esq-panel__column-chevron">
            <Icon icon={isOpen ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} size={18} />
          </span>
        </button>
        <ul className="lpv-esq-panel__list">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} onClick={(event) => event.preventDefault()}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="lpv-esq-panel">
      <div className="lpv-esq-panel__columns">
        {column('services', 'Services et informations', SERVICES)}
        {column('legal', 'Légales', LEGAL)}
      </div>
      <div className="lpv-esq-panel__footer">
        <ThemeToggle variant="panel" />
      </div>
    </div>
  )
}

function useMenuSections() {
  const [cols, setCols] = useState<Set<ColId>>(new Set())

  function toggleCol(id: ColId) {
    setCols((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return { cols, toggleCol }
}

// Sidebar (variantes B et C) : items du portail, groupe Bibliothèque
// repliable avec sous-items, un item « à venir » pour montrer la marge
// d'évolution, bascule de thème en pied de sidebar.
function SidebarNav() {
  const [biblioOpen, setBiblioOpen] = useState(true)

  return (
    <>
      <p className="lpv-esq-side__heading">Portail profs</p>
      <ul className="lpv-esq-nav">
        <NavItem active icon="rivet-icons:list" label="Mes séances" />
        <NavItem icon="rivet-icons:calendar" label="Calendrier" />
        <NavItem icon="rivet-icons:user-group-solid" label="Mes élèves" />
        <li>
          <button
            aria-expanded={biblioOpen}
            className={`lpv-esq-nav__link lpv-esq-nav__link--group${biblioOpen ? ' lpv-esq-nav__link--open' : ''}`}
            onClick={() => setBiblioOpen(!biblioOpen)}
            type="button"
          >
            <Icon icon="boxicons:book-open" size={18} />
            <span className="lpv-esq-nav__text">Bibliothèque</span>
            <span aria-hidden="true" className="lpv-esq-nav__chevron">
              <Icon icon={biblioOpen ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} size={16} />
            </span>
          </button>
          {biblioOpen && (
            <ul className="lpv-esq-nav">
              <NavItem icon="boxicons:book-bookmark" label="Livres" sub />
              <NavItem icon="boxicons:swap-horizontal" label="Prêts" sub />
            </ul>
          )}
        </li>
        <NavItem icon="rivet-icons:clock" label="Mes disponibilités" />
        <NavItem icon="boxicons:bell" label="Alertes" muted />
      </ul>
      <div className="lpv-esq-side__footer">
        <ThemeToggle variant="panel" />
      </div>
    </>
  )
}

function NavItem({
  active,
  icon,
  label,
  muted,
  sub,
}: {
  active?: boolean
  icon: string
  label: string
  muted?: boolean
  sub?: boolean
}) {
  const className = [
    'lpv-esq-nav__link',
    sub ? 'lpv-esq-nav__link--sub' : '',
    active ? 'lpv-esq-nav__link--active' : '',
    muted ? 'lpv-esq-nav__link--muted' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li>
      <a className={className} href="#" onClick={(event) => event.preventDefault()}>
        <Icon icon={icon} size={sub ? 16 : 18} />
        <span className="lpv-esq-nav__text">{label}</span>
        {muted && <span className="lpv-esq-nav__badge">à venir</span>}
      </a>
    </li>
  )
}

function FakeMain() {
  return (
    <main className="lpv-esq-main">
      <h2 className="lpv-esq-main__title">Mes séances</h2>
      <p className="lpv-esq-main__caption">Données factices — le contenu réel n&apos;est pas la cible de cette esquisse.</p>
      <div className="lpv-esq-stats">
        <div className="lpv-esq-stat">
          <span className="lpv-esq-stat__value">2</span>
          <span className="lpv-esq-stat__label">Séance(s) aujourd&apos;hui</span>
        </div>
        <div className="lpv-esq-stat">
          <span className="lpv-esq-stat__value">8</span>
          <span className="lpv-esq-stat__label">Cette semaine</span>
        </div>
        <div className="lpv-esq-stat lpv-esq-stat--alert">
          <span className="lpv-esq-stat__value">3</span>
          <span className="lpv-esq-stat__label">En retard de traitement</span>
        </div>
      </div>
      <div className="lpv-esq-rows">
        {SEANCES.map((row) => (
          <div className="lpv-esq-row" key={row.nom}>
            <div>
              <p className="lpv-esq-row__name">{row.nom}</p>
              <p className="lpv-esq-row__detail">{row.detail}</p>
            </div>
            <Tag color={row.color}>{row.tag}</Tag>
          </div>
        ))}
      </div>
    </main>
  )
}

// A — statu quo : entête portail actuel (bande + hero) + menu dépliant.
export function EsquisseA({ size }: { size: FrameSize }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { cols, toggleCol } = useMenuSections()

  return (
    <Frame size={size} variante="a">
      <header className="lpv-esq-head">
        <Bar
          actions={
            <>
              <Avatar email="olivier.durand@lpv.fr" nom="Olivier Durand" />
              <span aria-hidden="true" className="lpv-o-header__separator" />
              <MenuButton open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
            </>
          }
          panel={menuOpen ? <MenuPanel cols={cols} onToggleCol={toggleCol} /> : null}
        />
        <div className="lpv-esq-hero">
          <p className="lpv-esq-hero__text">Vos séances, présences et retours de séance, au même endroit.</p>
        </div>
      </header>
      <FakeMain />
    </Frame>
  )
}

// B — sidebar persistante >= 41rem ; sous 41rem, on garde le menu dépliant
// (le CSS masque la sidebar — aucun changement mobile).
export function EsquisseB({ size }: { size: FrameSize }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { cols, toggleCol } = useMenuSections()

  return (
    <Frame size={size} variante="b">
      <header className="lpv-esq-head">
        <Bar
          actions={
            <>
              <Avatar email="olivier.durand@lpv.fr" nom="Olivier Durand" />
              <span aria-hidden="true" className="lpv-o-header__separator" />
              <MenuButton open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
            </>
          }
          panel={menuOpen ? <MenuPanel cols={cols} onToggleCol={toggleCol} /> : null}
        />
      </header>
      <div className="lpv-esq-body">
        <nav aria-label="Navigation du portail" className="lpv-esq-side">
          <SidebarNav />
        </nav>
        <FakeMain />
      </div>
    </Frame>
  )
}

// C — sidebar unique : persistante >= 41rem, off-canvas (drawer + overlay)
// sous 41rem. Un seul markup, deux comportements pilotés par le CSS.
export function EsquisseC({ size }: { size: FrameSize }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Frame size={size} variante="c">
      <header className="lpv-esq-head">
        <Bar
          actions={
            <>
              <Avatar email="olivier.durand@lpv.fr" nom="Olivier Durand" />
              <span aria-hidden="true" className="lpv-o-header__separator" />
              <MenuButton open={drawerOpen} onToggle={() => setDrawerOpen(!drawerOpen)} />
            </>
          }
        />
      </header>
      <div className="lpv-esq-body">
        <nav
          aria-label="Navigation du portail"
          className={`lpv-esq-side${drawerOpen ? ' lpv-esq-side--open' : ''}`}
        >
          <SidebarNav />
        </nav>
        {drawerOpen && (
          <button aria-label="Fermer le menu" className="lpv-esq-overlay" onClick={() => setDrawerOpen(false)} type="button" />
        )}
        <FakeMain />
      </div>
    </Frame>
  )
}
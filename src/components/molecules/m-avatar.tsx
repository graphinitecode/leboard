'use client'

import { useRef, useState } from 'react'

import { Icon } from '@/components/atoms/a-icon'
import { useCloseOnClickOutside } from '@/hooks/useCloseOnClickOutside'

import { logout } from './m-logout'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const result = parts.map((m) => m.charAt(0)).slice(0, 2)
  return result.join('').toUpperCase()
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

// Molécule : avatar utilisateur de l'entête portail (connecté uniquement).
// Trigger : prénom + cercle d'initiales + chevron (motif CollapsibleMenu) ;
// le nom complet reste porté par l'aria-label, le title et le panneau.
// Dropdown : identité (nom + email, lecture seule) et déconnexion
// (server action logout : suppression du cookie puis redirection).
export function Avatar({ nom, email }: { nom: string; email: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Ferme au clic extérieur ou à Escape (même mécanique que CollapsibleMenu)
  useCloseOnClickOutside(ref, () => setOpen(false))

  return (
    <div ref={ref} className="lpv-m-avatar-header">
      <button
        aria-expanded={open}
        aria-label={`Connecté en tant que ${nom}. Ouvrir le menu du compte`}
        className="lpv-m-avatar-header__button"
        onClick={() => setOpen(!open)}
        title={`Connecté en tant que ${nom}`}
        type="button"
      >
        <span className="lpv-m-avatar-header__name">{firstName(nom)}</span>
        <span aria-hidden="true" className="lpv-avatar">
          {initials(nom)}
        </span>
        <span aria-hidden="true" className="lpv-m-avatar-header__chevron">
          <Icon icon={open ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} size={18} />
        </span>
      </button>

      {open && (
        <div className="lpv-m-avatar-panel">
          <div className="lpv-m-avatar-panel__identity">
            <p className="lpv-m-avatar-panel__name">{nom}</p>
            <p className="lpv-m-avatar-panel__email">{email}</p>
          </div>
          <ul className="lpv-m-avatar-panel__list">
            <li>
              <form action={logout}>
                <button type="submit">
                  <Icon icon="boxicons:power" size={18} /> Se déconnecter
                </button>
              </form>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

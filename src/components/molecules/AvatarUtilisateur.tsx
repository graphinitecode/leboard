'use client'

import { useRef, useState } from 'react'

import { Icon } from '@/components/atoms/Icon'
import { useFermerHorsClic } from '@/hooks/useFermerHorsClic'

import { seDeconnecter } from './seDeconnecter'

function initiales(nom: string): string {
  const morceaux = nom.trim().split(/\s+/)
  const initiales = morceaux.map((m) => m.charAt(0)).slice(0, 2)
  return initiales.join('').toUpperCase()
}

function prenom(nom: string): string {
  return nom.trim().split(/\s+/)[0] ?? nom
}

// Molécule : avatar utilisateur de l'entête portail (connecté uniquement).
// Trigger : prénom + cercle d'initiales + chevron (motif MenuDepliant) ;
// le nom complet reste porté par l'aria-label, le title et le panneau.
// Dropdown : identité (nom + email, lecture seule) et déconnexion
// (server action seDeconnecter : suppression du cookie puis redirection).
export function AvatarUtilisateur({ nom, email }: { nom: string; email: string }) {
  const [ouvert, setOuvert] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Ferme au clic extérieur ou à Escape (même mécanique que MenuDepliant)
  useFermerHorsClic(ref, () => setOuvert(false))

  return (
    <div ref={ref} className="lpv-avatar-entete">
      <button
        aria-expanded={ouvert}
        aria-label={`Connecté en tant que ${nom}. Ouvrir le menu du compte`}
        className="lpv-avatar-entete__bouton"
        onClick={() => setOuvert(!ouvert)}
        title={`Connecté en tant que ${nom}`}
        type="button"
      >
        <span className="lpv-avatar-entete__nom">{prenom(nom)}</span>
        <span aria-hidden="true" className="lpv-avatar">
          {initiales(nom)}
        </span>
        <span aria-hidden="true" className="lpv-avatar-entete__chevron">
          <Icon icone={ouvert ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} taille={18} />
        </span>
      </button>

      {ouvert && (
        <div className="lpv-avatar-panneau">
          <div className="lpv-avatar-panneau__identite">
            <p className="lpv-avatar-panneau__nom">{nom}</p>
            <p className="lpv-avatar-panneau__email">{email}</p>
          </div>
          <ul className="lpv-avatar-panneau__liste">
            <li>
              <form action={seDeconnecter}>
                <button type="submit">
                  <Icon icone="boxicons:power" taille={18} /> Se déconnecter
                </button>
              </form>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
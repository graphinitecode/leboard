import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EmptyState } from '@/components/molecules'

// Molécule d'état vide : badge teinté + titre + description + actions, en
// deux tailles. Les actions à onClick n'ont de sens que côté client (une
// fonction ne traverse pas la frontière serveur) ; côté serveur on passe href.

describe('EmptyState', () => {
  it('affiche titre, description et icône fournie, sans actions', () => {
    render(
      <EmptyState
        description="Aucun retour en attente pour le moment."
        icon="rivet-icons:chat-solid"
        title="Toutes tes séances sont à jour"
        variant="success"
      />,
    )

    expect(screen.getByText('Toutes tes séances sont à jour').className).toContain('lpv-m-empty-state__title')
    expect(screen.getByText('Aucun retour en attente pour le moment.')).toBeDefined()
    // Icône décorative (aria-hidden) rendue par l'atome Icon dans le badge
    const badge = document.querySelector('.lpv-m-empty-state__badge')
    expect(badge?.querySelector('svg')).not.toBeNull()
    expect(badge?.querySelector('svg')?.getAttribute('aria-hidden')).toEqual('true')
    expect(document.querySelector('.lpv-m-empty-state--success')).not.toBeNull()
    expect(document.querySelector('.lpv-m-empty-state__actions')).toBeNull()
  })

  it('description facultative : le bloc titre se suffit à lui-même', () => {
    render(<EmptyState className="essai" title="Aucune progression." />)

    expect(document.querySelector('.lpv-m-empty-state__description')).toBeNull()
    expect(document.querySelector('div.essai')).not.toBeNull()
  })

  it('actions : bouton cliquable et lien navigation', async () => {
    const user = userEvent.setup()
    const reinitialiser = vi.fn()
    render(
      <EmptyState
        actions={[
          { href: '/profs/eleves', label: 'Contacter l administration', variant: 'primary' },
          { label: 'Réinitialiser les filtres', onClick: reinitialiser, variant: 'secondary' },
        ]}
        description="Essaie un autre titre, auteur ou niveau."
        title="Aucun livre ne correspond à ta recherche"
      />,
    )

    const lien = screen.getByRole('link', { name: 'Contacter l administration' })
    expect(lien.getAttribute('href')).toEqual('/profs/eleves')

    await user.click(screen.getByRole('button', { name: 'Réinitialiser les filtres' }))
    expect(reinitialiser).toHaveBeenCalledTimes(1)
  })

  it('variante compact : espacement réduit', () => {
    render(<EmptyState compact title="Aucune disponibilité déclarée" variant="warning" />)

    expect(document.querySelector('.lpv-m-empty-state--compact')).not.toBeNull()
    expect(document.querySelector('.lpv-m-empty-state--warning .lpv-m-empty-state__badge svg')).not.toBeNull()
  })

  it('icône de repli selon la variante quand icon absent', () => {
    render(<EmptyState title="Aucun élève ne t est encore assigné" variant="info" />)

    expect(document.querySelector('.lpv-m-empty-state--info .lpv-m-empty-state__badge svg')).not.toBeNull()
  })
})
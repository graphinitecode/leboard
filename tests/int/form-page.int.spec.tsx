import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormPage } from '@/components/templates/t-form-page'

describe('FormPage', () => {
  it('rend le titre, le formulaire et le conteneur lpv-login', () => {
    const { container } = render(
      <FormPage title="Connexion">
        <input id="email" type="email" />
      </FormPage>,
    )
    expect(container.querySelector('.lpv-login')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Connexion')
    expect(container.querySelector('#email')).not.toBeNull()
  })

  it('rend le sous-titre quand fourni', () => {
    render(
      <FormPage subtitle="Connectez pour accéder à l'espace parents." title="Connexion">
        <p>Formulaire</p>
      </FormPage>,
    )
    expect(screen.getByText("Connectez pour accéder à l'espace parents.")).toBeDefined()
  })

  it('omet le sous-titre quand absent', () => {
    const { container } = render(
      <FormPage title="Connexion">
        <p>Formulaire</p>
      </FormPage>,
    )
    expect(container.querySelector('.lpv-login__subtitle')).toBeNull()
  })

  it('rend le lien retour avant le titre quand fourni', () => {
    const { container } = render(
      <FormPage retour={{ href: '/profs/login', label: 'Retour à la connexion' }} title="Réinitialiser">
        <p>Formulaire</p>
      </FormPage>,
    )
    const lien = screen.getByRole('link', { name: 'Retour à la connexion' })
    expect(lien.getAttribute('href')).toBe('/profs/login')
    // Le lien précède le h1 dans le document
    const titre = container.querySelector('h1') as HTMLElement
    expect(lien.compareDocumentPosition(titre) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

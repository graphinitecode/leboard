import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ResumeErreurs } from '@/components/molecules/Notifications'

describe('ResumeErreurs (focus)', () => {
  it('prend le focus quand il apparait', () => {
    const { container } = render(<ResumeErreurs erreurs={['Le nom est requis']} />)
    expect(document.activeElement).toBe(container.querySelector('.lpv-error-summary'))
  })

  it('ne vole pas le focus aux re-renders suivants (saisie dans un champ)', () => {
    const { rerender, container } = render(
      <ResumeErreurs erreurs={[{ champId: 'email', texte: 'Email incorrect' }]} />,
    )
    const summary = container.querySelector('.lpv-error-summary') as HTMLElement
    expect(document.activeElement).toBe(summary)

    // L'utilisateur cliquera dans un champ : le focus n'est plus le summary
    const champ = document.createElement('input')
    document.body.appendChild(champ)
    champ.focus()
    expect(document.activeElement).toBe(champ)

    // Re-render avec le MEME texte (recree le tableau) : le focus ne doit pas revenir au summary
    rerender(<ResumeErreurs erreurs={[{ champId: 'email', texte: 'Email incorrect' }]} />)
    expect(document.activeElement).toBe(champ)
    expect(document.activeElement).not.toBe(container.querySelector('.lpv-error-summary'))
  })

  it('reprend le focus apres disparition puis reappearance (nouveau submit en echec)', () => {
    const { rerender, container } = render(<ResumeErreurs erreurs={['Erreur A']} />)
    expect(document.activeElement).toBe(container.querySelector('.lpv-error-summary'))

    // Soumission suivante : erreur effacee puis nouvelle erreur -> focus de nouveau legitime
    rerender(<ResumeErreurs erreurs={[]} />)
    rerender(<ResumeErreurs erreurs={['Erreur B']} />)
    expect(document.activeElement).toBe(container.querySelector('.lpv-error-summary'))
  })
})
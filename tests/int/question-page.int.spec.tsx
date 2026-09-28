import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { QuestionPage, QuestionPageAnswers } from '@/components/templates/t-question-page'

describe('QuestionPage', () => {
  it('rend le back link, la caption, la question et les actions', () => {
    const { container } = render(
      <QuestionPage
        actions={<button type="button">Continuer</button>}
        question="Quelle heure de début ?"
        retour={{ href: '#', label: 'Retour' }}
        step={2}
        stepSize={3}
      >
        <p>Contrôle de réponse</p>
      </QuestionPage>,
    )
    expect(screen.getByText('Retour')).toBeDefined()
    expect(screen.getByText('Étape 2 sur 3')).toBeDefined()
    expect(screen.getByText('Quelle heure de début ?')).toBeDefined()
    expect(container.querySelector('.lpv-t-question-page__actions')).not.toBeNull()
    expect(container.querySelector('h1.lpv-a-label-wrapper')).not.toBeNull()
    expect(container.querySelector('.lpv-t-question-page__actions')).not.toBeNull()
    expect(screen.getByText('Continuer')).toBeDefined()
  })

  it('omet le back link, la caption et les actions quand absents', () => {
    const { container } = render(
      <QuestionPage question="Séance créée">
        <p>Confirmation</p>
      </QuestionPage>,
    )
    expect(container.querySelector('.lpv-back-link')).toBeNull()
    expect(container.querySelector('.lpv-t-question-page__step')).toBeNull()
    expect(container.querySelector('.lpv-t-question-page__actions')).toBeNull()
    expect(screen.getByText('Confirmation')).toBeDefined()
  })

  it('affiche le bloc vos reponses avec liens Modifier', () => {
    let modifie = false
    render(
      <QuestionPage
        question="Quelle heure de fin ?"
        reponses={[
          { question: 'Jour', valeur: 'Mercredi', href: '#jour' },
          { question: 'Heure de début', valeur: '14:00', onClick: () => (modifie = true) },
        ]}
        step={3}
        stepSize={3}
      >
        <p>Contrôle</p>
      </QuestionPage>,
    )
    expect(screen.getByText('Vos réponses')).toBeDefined()
    expect(screen.getByText('Mercredi')).toBeDefined()
    const liens = screen.getAllByText('Modifier')
    expect(liens).toHaveLength(2)
    fireEvent.click(liens[1])
    expect(modifie).toBe(true)
  })
})

describe('QuestionPageAnswers', () => {
  it('rend un titre personnalise et les rows', () => {
    render(
      <QuestionPageAnswers
        reponses={[{ question: 'Créneau', valeur: 'Mercredi · 14:00 → 16:00' }]}
        titre="Récapitulatif"
      />,
    )
    expect(screen.getByText('Récapitulatif')).toBeDefined()
    expect(screen.getByText('Créneau')).toBeDefined()
    expect(screen.getByText('Mercredi · 14:00 → 16:00')).toBeDefined()
  })

  it('omet le lien Modifier sans href ni onClick', () => {
    render(<QuestionPageAnswers reponses={[{ question: 'Jour', valeur: 'Lundi' }]} />)
    expect(screen.queryByText('Modifier')).toBeNull()
  })
})
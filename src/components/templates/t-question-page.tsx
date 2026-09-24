import type { MouseEventHandler, ReactNode } from 'react'

import { BackLink } from '@/components/atoms/a-back-link'
import { Label } from '@/components/atoms'
import { Stepper } from '@/components/atoms/a-stepper'

// Template : page-question du pattern GOV.UK « question pages »
// (docs/design-system.md §1.5). Un objectif par page, le h1 est la question
// elle-même, back link en tête, caption « Étape N sur M », boutons d'action
// alignés au bord gauche. Le conteneur est fluide (width: 100%, plafonné à
// --lpv-container-xs) : jamais de débordement, largeur stable quelle que soit
// la longueur de la question.
export function QuestionPage({
  children,
  actions,
  question,
  retour,
  step,
  stepSize,
  htmlFor = step ? `question_${step}` : 'question',
  reponses,
}: {
  children: ReactNode
  actions?: ReactNode
  question: string
  retour?: { href: string; label?: string; onClick?: MouseEventHandler<HTMLAnchorElement> }
  step?: number
  stepSize?: number
  htmlFor?: string
  reponses?: QuestionPageReponse[]
}) {
  return (
    <div className="lpv-t-question-page">
      {retour && (
        <BackLink href={retour.href} onClick={retour.onClick}>
          {retour.label ?? 'Retour'}
        </BackLink>
      )}
      {step && <Stepper step={step} size={stepSize} />}
      <Label htmlFor={`${htmlFor}`} size="l">
        {question}
      </Label>
      <div className="lpv-t-question-page__content">{children}</div>
      {reponses && reponses.length > 0 && <QuestionPageAnswers reponses={reponses} />}
      {actions && <div className="lpv-t-question-page__actions">{actions}</div>}
    </div>
  )
}

export interface QuestionPageReponse {
  question: string
  valeur: ReactNode
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
}

// Bloc « Vos réponses » (pattern GOV.UK) : les réponses déjà données,
// avec un lien « Modifier » par ligne, affiché sous les questions suivantes.
export function QuestionPageAnswers({
  titre = 'Vos réponses',
  reponses,
}: {
  titre?: string
  reponses: QuestionPageReponse[]
}) {
  return (
    <div className="lpv-t-question-page__answers">
      <h2 className="lpv-t-question-page__answers-title">{titre}</h2>
      <dl className="lpv-t-question-page__answers-list">
        {reponses.map((reponse) => (
          <div className="lpv-t-question-page__answers-row" key={reponse.question}>
            <dt className="lpv-t-question-page__answers-key">{reponse.question}</dt>
            <dd className="lpv-t-question-page__answers-value">{reponse.valeur}</dd>
            {(reponse.href || reponse.onClick) && (
              <dd className="lpv-t-question-page__answers-action">
                <a
                  href={reponse.href ?? '#'}
                  onClick={(e) => {
                    if (reponse.onClick) {
                      e.preventDefault()
                      reponse.onClick(e)
                    }
                  }}
                >
                  Modifier
                </a>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  )
}

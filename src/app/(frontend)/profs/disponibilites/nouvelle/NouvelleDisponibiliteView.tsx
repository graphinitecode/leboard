'use client'

import { Suspense, useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Panel } from '@/components/atoms'
import { Button } from '@/components/atoms/a-button'
import { EnterText } from '@/components/atoms/a-enter-text'
import { ErrorSummary, Input } from '@/components/molecules'
import { QuestionPage, QuestionPageAnswers } from '@/components/templates'

import {
  useAjouterDisponibilite,
  useModifierDisponibilite,
} from '@/planning/application/planning.hooks'
import { JOURS_SEMAINE, validerHeures } from '@/planning/domain/disponibilite.entity'
import { HEURE_FIN_COURS_HHMM } from '@/shared/horaires'
import type { Disponibilite, JourSemaine } from '@/planning/domain/disponibilite.entity'

const OPTIONS_JOUR = [
  { label: 'Lundi', value: 'lundi' },
  { label: 'Mardi', value: 'mardi' },
  { label: 'Mercredi', value: 'mercredi' },
  { label: 'Jeudi', value: 'jeudi' },
  { label: 'Vendredi', value: 'vendredi' },
  { label: 'Samedi', value: 'samedi' },
  { label: 'Dimanche', value: 'dimanche' },
]

type Etape = 1 | 2 | 3 | 4 | 5

// Parcours dédié d'ajout/modification d'un créneau de disponibilité,
// « une question par écran » (pattern GOV.UK question pages), comme les
// parcours prêt et séance : jour → heure de début → heure de fin →
// « Vérifiez vos réponses » → page de confirmation.
// Préremplissage par URL pour l'édition :
// /profs/disponibilites/nouvelle?jour=lundi&debut=14:00&fin=16:00
// Les trois params présents et valides basculent en mode modification.
export default function NouvelleDisponibiliteView() {
  return (
    <Suspense fallback={<p className="lpv-muted">Chargement…</p>}>
      <ParcoursDisponibilite />
    </Suspense>
  )
}

function ParcoursDisponibilite() {
  const router = useRouter()
  const params = useSearchParams()
  const initial = useMemo(() => initialiserDepuisParams(params), [params])
  const estModification = initial !== null

  const [step, setStep] = useState<Etape>(1)
  const [jour, setJour] = useState<JourChoisi>(initial?.jour ?? '')
  const [heureDebut, setHeureDebut] = useState(initial?.debut ?? '')
  const [heureFin, setHeureFin] = useState(initial?.fin ?? '')
  const [pending, startTransition] = useTransition()
  const [erreur, setErreur] = useState<string | null>(null)
  const ajouterDispo = useAjouterDisponibilite()
  const modifierDispo = useModifierDisponibilite()

  function annuler() {
    router.push('/profs/disponibilites')
  }

  // Heure de fin validée avant le récapitulatif : l'erreur s'affiche sur la
  // question concernée, pas après coup.
  function continuerVersRecap() {
    const invalide = validerHeures(heureDebut, heureFin)
    if (invalide) {
      setErreur(invalide)
      return
    }
    setErreur(null)
    setStep(4)
  }

  function recommencer() {
    setJour('')
    setHeureDebut('')
    setHeureFin('')
    setErreur(null)
    setStep(1)
  }

  function enregistrer() {
    setErreur(null)
    startTransition(async () => {
      const nouveau: Disponibilite = { heureDebut, heureFin, jour: jour as JourSemaine }
      try {
        if (estModification) {
          const origine: Disponibilite = {
            heureDebut: initial.debut,
            heureFin: initial.fin,
            jour: initial.jour,
          }
          await modifierDispo.mutateAsync({ nouveau, origine })
        } else {
          await ajouterDispo.mutateAsync(nouveau)
        }
        setStep(5)
      } catch (err) {
        setErreur(err instanceof Error ? err.message : 'La disponibilité n’a pas pu être enregistrée.')
      }
    })
  }

  const dayLabel = OPTIONS_JOUR.find((o) => o.value === jour)?.label ?? jour

  return (
    <div className="lpv-container">
      {step === 1 && (
        <QuestionPage
          actions={
            <>
              <Button disabled={!jour} onClick={() => setStep(2)} type="button" variant="success">
                Continuer
              </Button>
              <Button onClick={annuler} type="button" variant="secondary">
                Annuler
              </Button>
            </>
          }
          question={estModification ? 'Quel jour pour cet horaire ?' : 'Quel jour vous convient ?'}
          retour={{ href: '/profs/disponibilites', label: 'Retour aux disponibilités' }}
          step={1}
          stepSize={4}
        >
          <div className="lpv-o-availability-wizard__days">
            {OPTIONS_JOUR.map((option) => (
              <button
                className={`lpv-o-availability-wizard__day-option${jour === option.value ? ' lpv-o-availability-wizard__day-option--active' : ''}`}
                key={option.value}
                onClick={() => setJour(option.value as JourChoisi)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </QuestionPage>
      )}

      {step === 2 && (
        <QuestionPage
          actions={
            <>
              <Button
                disabled={!heureDebut}
                onClick={() => {
                  setErreur(null)
                  setStep(3)
                }}
                type="button"
                variant="success"
              >
                Continuer
              </Button>
            </>
          }
          question="Quelle heure de début ?"
          retour={{ href: '#', onClick: () => { setErreur(null); setStep(1) } }}
          step={2}
          stepSize={4}
        >
          {erreur && <ErrorSummary errors={[erreur]} />}
          <Input
            hint={`Début du créneau le ${dayLabel.toLowerCase()}.`}
            id="step-debut"
            label="De"
            max={HEURE_FIN_COURS_HHMM}
            min="08:00"
            onChange={(e) => setHeureDebut(e.target.value)}
            type="time"
            value={heureDebut}
          />
        </QuestionPage>
      )}

      {step === 3 && (
        <QuestionPage
          actions={
            <>
              <Button disabled={!heureFin} onClick={continuerVersRecap} type="button" variant="success">
                Continuer
              </Button>
            </>
          }
          question="Quelle heure de fin ?"
          retour={{ href: '#', onClick: () => { setErreur(null); setStep(2) } }}
          step={3}
          stepSize={4}
        >
          {erreur && <ErrorSummary errors={[erreur]} />}
          <Input
            hint={`Fin du créneau le ${dayLabel.toLowerCase()}.`}
            id="step-fin"
            label="À"
            max={HEURE_FIN_COURS_HHMM}
            min={heureDebut || '08:00'}
            onChange={(e) => setHeureFin(e.target.value)}
            type="time"
            value={heureFin}
          />
        </QuestionPage>
      )}

      {step === 4 && (
        <QuestionPage
          actions={
            <>
              <Button disabled={pending} onClick={enregistrer} type="button" variant="success">
                {pending
                  ? 'Enregistrement…'
                  : estModification
                    ? 'Enregistrer la modification'
                    : 'Ajouter ce créneau'}
              </Button>
            </>
          }
          question="Vérifiez vos réponses"
          retour={{ href: '#', onClick: () => { setErreur(null); setStep(3) } }}
          step={4}
          stepSize={4}
        >
          {erreur && <ErrorSummary errors={[erreur]} />}
          <QuestionPageAnswers
            reponses={[
              { question: 'Jour', valeur: dayLabel, onClick: () => setStep(1) },
              { question: 'Heure de début', valeur: heureDebut, onClick: () => setStep(2) },
              { question: 'Heure de fin', valeur: heureFin, onClick: () => setStep(3) },
            ]}
            titre=""
          />
        </QuestionPage>
      )}

      {step === 5 && (
        <QuestionPage question={estModification ? 'Disponibilité modifiée' : 'Disponibilité ajoutée'}>
          <Panel variante="success" title="Votre créneau est enregistré">
            {dayLabel} · {heureDebut} → {heureFin}
          </Panel>
          <p className="pb-7">
            L&rsquo;association s&rsquo;en servira pour vous proposer des séances.
          </p>

          <div className="lpv-t-question-page__actions">
            <EnterText hrf="/profs/disponibilites">Retour à mes disponibilités</EnterText>
            {!estModification && (
              <Button onClick={recommencer} type="button" variant="secondary">
                Ajouter un autre créneau
              </Button>
            )}
          </div>
        </QuestionPage>
      )}
    </div>
  )
}

type JourChoisi = JourSemaine | ''

// Lecture des paramètres de préremplissage (?jour=lundi&debut=HH:mm&fin=HH:mm).
// Modification seulement si les trois paramètres sont présents et valides.
function initialiserDepuisParams(params: URLSearchParams):
  | { jour: JourSemaine; debut: string; fin: string }
  | null {
  const jourParam = params.get('jour')
  const debutParam = params.get('debut')
  const finParam = params.get('fin')

  const jourValide = (JOURS_SEMAINE as string[]).includes(jourParam ?? '')
  const debutValide = /^\d{2}:\d{2}$/.test(debutParam ?? '')
  const finValide = /^\d{2}:\d{2}$/.test(finParam ?? '')

  if (!jourValide || !debutValide || !finValide) return null

  return {
    debut: debutParam as string,
    fin: finParam as string,
    jour: jourParam as JourSemaine,
  }
}
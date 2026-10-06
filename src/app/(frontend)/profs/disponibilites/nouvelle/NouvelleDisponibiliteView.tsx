'use client'

import { Suspense, useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/atoms/a-button'
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

type Etape = 1 | 2 | 3

// Parcours dédié d'ajout/modification d'un créneau de disponibilité,
// « une question par écran » (pattern GOV.UK question pages) :
// jour → heure de début (avec « Vos réponses ») → heure de fin + récap.
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

  function enregistrer() {
    const invalide = validerHeures(heureDebut, heureFin)
    if (invalide) {
      setErreur(invalide)
      return
    }
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
        const resultat = estModification ? 'modification' : 'ajout'
        router.push(`/profs/disponibilites?enregistre=${resultat}`)
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
              <Button disabled={!jour} onClick={() => setStep(2)} type="button">
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
          stepSize={3}
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
              {erreur && <ErrorSummary errors={[erreur]} />}
              <Button
                disabled={!heureDebut}
                onClick={() => {
                  setErreur(null)
                  setStep(3)
                }}
                type="button"
              >
                Continuer
              </Button>
            </>
          }
          question="Quelle heure de début ?"
          reponses={[{ question: 'Jour', valeur: dayLabel, onClick: () => setStep(1) }]}
          retour={{ href: '#', onClick: () => { setErreur(null); setStep(1) } }}
          step={2}
          stepSize={3}
        >
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
              {erreur && <ErrorSummary errors={[erreur]} />}
              <Button disabled={!heureFin || pending} onClick={enregistrer} type="button">
                {pending
                  ? 'Enregistrement…'
                  : estModification
                    ? 'Enregistrer la modification'
                    : 'Valider'}
              </Button>
            </>
          }
          question="Quelle heure de fin ?"
          reponses={[
            { question: 'Jour', valeur: dayLabel, onClick: () => setStep(1) },
            { question: 'Heure de début', valeur: heureDebut || '—', onClick: () => setStep(2) },
          ]}
          retour={{ href: '#', onClick: () => { setErreur(null); setStep(2) } }}
          step={3}
          stepSize={3}
        >
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
          <QuestionPageAnswers
            titre="Récapitulatif"
            reponses={[
              { question: 'Créneau', valeur: `${dayLabel} · ${heureDebut} → ${heureFin || '…'}` },
            ]}
          />
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
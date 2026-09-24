'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/atoms/a-button'
import { Panel } from '@/components/atoms/a-panel'
import { ErrorSummary } from '@/components/molecules/m-notifications'
import { QuestionPage, QuestionPageAnswers } from '@/components/templates'
import type { QuestionPageReponse } from '@/components/templates'
import {
  HEURE_DEBUT_GRILLE,
  HEURE_FIN_GRILLE,
  JOURS_GRILLE,
  chevaucheUne,
  dateCiblee,
  debutSemaine,
  bornesSemaine,
  joursGrille,
} from '@/calendrier/domain/calendrier.utils'
import type { MatiereCalendrier } from '@/calendrier/domain/calendrier.entity'
import { useCreerSeance, useElevesDuProf, useSeancesPeriode } from '@/calendrier'

const MATIERES: { label: string; value: MatiereCalendrier }[] = [
  { label: 'Maths', value: 'maths' },
  { label: 'Français', value: 'francais' },
  { label: 'Anglais', value: 'anglais' },
  { label: 'Autre', value: 'autre' },
]

type Etape = 'jour' | 'debut' | 'fin' | 'matiere' | 'eleves' | 'recap' | 'confirme'

// Parcours « une question par écran » (pattern GOV.UK question pages),
// construit sur le template QuestionPage : chaque page = back link + caption
// + h1 (la question) + contrôle + « Vos réponses » + Continuer.
// Dernière page : « Vérifiez vos réponses » (récapitulatif) puis confirmation.
export default function NouvelleSeanceView() {
  return (
    <Suspense fallback={<p className="lpv-muted">Chargement…</p>}>
      <ParcoursNouvelleSeance />
    </Suspense>
  )
}

function ParcoursNouvelleSeance() {
  const router = useRouter()
  const params = useSearchParams()
  const [step, setStep] = useState<Etape>('jour')
  const [erreur, setErreur] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // Préremplissage depuis l'URL (clic-tirer sur le calendrier, bouton d'un jour).
  const initial = useMemo(() => initialiserDepuisParams(params), [params])
  const [jourIndex, setJourIndex] = useState(initial.jourIndex)
  const [heureDebut, setHeureDebut] = useState(initial.heureDebut)
  const [heureFin, setHeureFin] = useState(initial.heureFin)
  const [matiere, setMatiere] = useState<MatiereCalendrier | ''>('')
  const [selection, setSelection] = useState<number[]>([])

  const lundi = useMemo(() => debutSemaine(new Date()), [])
  const { debut, fin } = useMemo(() => bornesSemaine(lundi), [lundi])
  const seances = useSeancesPeriode({ debut, fin })
  const eleves = useElevesDuProf()
  const creer = useCreerSeance()

  const events = seances.data ?? []
  const duree = heureDebut && heureFin ? plageMinutes(heureDebut, heureFin) : null
  const conflit =
    heureDebut && heureFin
      ? chevaucheUne(
          { debut: dateCiblee(lundi, { jourIndex, heureDebut }), dureeMin: duree ?? 60 },
          events,
        )
      : null

  const nomEleves = (eleves.data ?? [])
    .filter((e) => selection.includes(e.id))
    .map((e) => `${e.prenom} ${e.nom}`)
    .join(', ')

  const reponses: QuestionPageReponse[] = []
  if (step !== 'jour') {
    reponses.push({
      question: 'Quel jour ?',
      valeur: `${JOURS_GRILLE[jourIndex]} ${joursGrille(lundi)[jourIndex].getDate()}`,
      onClick: () => setStep('jour'),
    })
  }
  if (step === 'fin' || step === 'matiere' || step === 'eleves' || step === 'recap') {
    reponses.push({ question: 'Heure de début', valeur: heureDebut || '—', onClick: () => setStep('debut') })
  }
  if (step === 'matiere' || step === 'eleves' || step === 'recap') {
    reponses.push({ question: 'Heure de fin', valeur: heureFin || '—', onClick: () => setStep('fin') })
  }
  if (step === 'eleves' || step === 'recap') {
    reponses.push({ question: 'Matière', valeur: labelMatiere(matiere), onClick: () => setStep('matiere') })
  }
  if (step === 'recap') {
    reponses.push({ question: 'Élèves', valeur: nomEleves || '—', onClick: () => setStep('eleves') })
  }

  async function valider() {
    if (!heureDebut || !heureFin || matiere === '' || selection.length === 0) return
    setErreur(null)
    setPending(true)
    try {
      await creer.mutateAsync({
        debut: dateCiblee(lundi, { jourIndex, heureDebut }),
        dureeMin: plageMinutes(heureDebut, heureFin),
        matiere,
        eleveIds: selection,
      })
      setPending(false)
      setStep('confirme')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'La séance n’a pas pu être créée.')
      setPending(false)
    }
  }

  function recommencer() {
    setStep('jour')
    setJourIndex(0)
    setHeureDebut('')
    setHeureFin('')
    setMatiere('')
    setSelection([])
    setErreur(null)
  }

  return (
    <>
      {step === 'jour' && (
        <QuestionPage
          actions={
            <>
              <Button onClick={() => setStep('debut')} type="button" variant="success">
                Continuer
              </Button>
              {/*<Button href="/profs">*/}
              {/*  Annuler*/}
              {/*</Button>*/}
            </>
          }
          question="Quel jour ?"
          retour={{ href: '/profs', label: 'Retour au Tableau de bord' }}
          step="Étape 1 sur 5"
        >
          <div className="lpv-o-availability-wizard__days">
            {JOURS_GRILLE.map((label, index) => (
              <button
                className={`lpv-o-availability-wizard__day-option${jourIndex === index ? ' lpv-o-availability-wizard__day-option--active' : ''}`}
                key={label}
                onClick={() => setJourIndex(index)}
                type="button"
              >
                {label} {joursGrille(lundi)[index].getDate()}
              </button>
            ))}
          </div>
        </QuestionPage>
      )}

      {step === 'debut' && (
        <QuestionPage
          actions={
            <Button
              disabled={!heureDebut}
              onClick={() => setStep('fin')}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="Quelle heure de début ?"
          reponses={reponses}
          retour={{ href: '#', onClick: () => setStep('jour') }}
          step="Étape 2 sur 5"
        >
          <InputTime
            hint={`Choisir une heure entre ${HEURE_DEBUT_GRILLE}h et ${HEURE_FIN_GRILLE}h.`}
            id="seance-debut"
            label=""
            onChange={setHeureDebut}
            value={heureDebut}
          />
        </QuestionPage>
      )}

      {step === 'fin' && (
        <QuestionPage
          actions={
            <Button
              disabled={!heureFin || (duree !== null && duree < 30)}
              onClick={() => setStep('matiere')}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="Quelle heure de fin ?"
          reponses={reponses}
          retour={{ href: '#', onClick: () => setStep('debut') }}
          step="Étape 3 sur 5"
        >
          <InputTime
            hint={duree ? `Durée : ${duree} min.` : undefined}
            id="seance-fin"
            label=""
            min={heureDebut || '08:00'}
            onChange={setHeureFin}
            value={heureFin}
          />
        </QuestionPage>
      )}

      {step === 'matiere' && (
        <QuestionPage
          actions={
            <Button
              disabled={matiere === ''}
              onClick={() => setStep('eleves')}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="Quelle matière ?"
          reponses={reponses}
          retour={{ href: '#', onClick: () => setStep('fin') }}
          step="Étape 4 sur 5"
        >
          <div className="lpv-o-availability-wizard__days">
            {MATIERES.map((option) => (
              <button
                className={`lpv-o-availability-wizard__day-option${matiere === option.value ? ' lpv-o-availability-wizard__day-option--active' : ''}`}
                key={option.value}
                onClick={() => setMatiere(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </QuestionPage>
      )}

      {step === 'eleves' && (
        <QuestionPage
          actions={
            <Button
              disabled={selection.length === 0}
              onClick={() => setStep('recap')}
              type="button"
            >
              Continuer
            </Button>
          }
          question="Quels élèves ?"
          reponses={reponses}
          retour={{ href: '#', onClick: () => setStep('matiere') }}
          step="Étape 5 sur 5"
        >
          {eleves.isLoading ? (
            <p className="lpv-muted">Chargement des élèves…</p>
          ) : (eleves.data ?? []).length === 0 ? (
            <p className="lpv-muted">
              Aucun élève référent. Vous pourrez compléter le groupe depuis la fiche de la séance.
            </p>
          ) : (
            eleves.data?.map((e) => (
              <label className="lpv-t-question-page__choice" key={e.id}>
                <input
                  checked={selection.includes(e.id)}
                  onChange={() =>
                    setSelection((s) =>
                      s.includes(e.id) ? s.filter((x) => x !== e.id) : [...s, e.id],
                    )
                  }
                  type="checkbox"
                  value={e.id}
                />{' '}
                {e.prenom} {e.nom} ({e.niveau})
              </label>
            ))
          )}
        </QuestionPage>
      )}

      {step === 'recap' && (
        <QuestionPage
          actions={
            <>
              {erreur && <ErrorSummary errors={[erreur]} />}
              <Button disabled={pending} onClick={valider} type="button">
                {pending ? 'Enregistrement…' : 'Valider'}
              </Button>
            </>
          }
          question="Vérifiez vos réponses"
          retour={{ href: '/profs', label: 'Tableau de bord' }}
        >
          <QuestionPageAnswers
            reponses={[
              {
                question: 'Jour',
                valeur: `${JOURS_GRILLE[jourIndex]} ${joursGrille(lundi)[jourIndex].getDate()}`,
                onClick: () => setStep('jour'),
              },
              {
                question: 'Heures',
                valeur: `${heureDebut} → ${heureFin}`,
                onClick: () => setStep('debut'),
              },
              {
                question: 'Matière',
                valeur: labelMatiere(matiere),
                onClick: () => setStep('matiere'),
              },
              {
                question: 'Élèves',
                valeur: nomEleves || '—',
                onClick: () => setStep('eleves'),
              },
            ]}
          />
          {conflit && (
            <p className="lpv-warning-text">
              Cette plage chevauche une séance existante ({labelMatiere(conflit.matiere)} à{' '}
              {conflit.debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}).
            </p>
          )}
        </QuestionPage>
      )}

      {step === 'confirme' && (
        <QuestionPage question="Séance créée">
          <Panel>
            {JOURS_GRILLE[jourIndex]} {joursGrille(lundi)[jourIndex].getDate()} · {heureDebut} →{' '}
            {heureFin} · {labelMatiere(matiere)} · {nomEleves}
          </Panel>
          <div className="lpv-t-question-page__actions" style={{ marginTop: '1.5rem' }}>
            <Button onClick={() => router.push('/profs')} type="button">
              Retour au tableau de bord
            </Button>
            <Button onClick={recommencer} type="button" variant="secondary">
              Créer une autre séance
            </Button>
          </div>
        </QuestionPage>
      )}
    </>
  )
}

// Lecture des paramètres de préremplissage (?date=YYYY-MM-DD&debut=HH:mm&fin=HH:mm).
function initialiserDepuisParams(params: URLSearchParams): {
  jourIndex: number
  heureDebut: string
  heureFin: string
} {
  const lundi = debutSemaine(new Date())
  const dateParam = params.get('date')
  let jourIndex = 0
  if (dateParam !== null && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const date = new Date(`${dateParam}T12:00:00`)
    const index = (date.getDay() + 6) % 7
    const lundiCible = debutSemaine(date)
    if (lundiCible.toDateString() === lundi.toDateString() && index <= 5) {
      jourIndex = index
    }
  }
  return {
    jourIndex,
    heureDebut: /^\d{2}:\d{2}$/.test(params.get('debut') ?? '') ? (params.get('debut') as string) : '',
    heureFin: /^\d{2}:\d{2}$/.test(params.get('fin') ?? '') ? (params.get('fin') as string) : '',
  }
}

function InputTime({
  id,
  label,
  hint,
  min = '08:00',
  max = '20:00',
  value,
  onChange,
}: {
  id: string
  label: string
  hint?: string
  min?: string
  max?: string
  value: string
  onChange: (valeur: string) => void
}) {
  return (
    <div className="lpv-form-group">
      <label className="lpv-label" htmlFor={id}>
        {label}
      </label>
      {hint && <p className="lpv-hint">{hint}</p>}
      <input
        className="lpv-a-input lpv-a-input--width-5"
        id={id}
        max={max}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        step={900}
        type="time"
        value={value}
      />
    </div>
  )
}

function labelMatiere(matiere: MatiereCalendrier | ''): string {
  if (matiere === '') return '—'
  return MATIERES.find((m) => m.value === matiere)?.label ?? '—'
}

function plageMinutes(debut: string, fin: string): number {
  const [dh, dm] = debut.split(':').map(Number)
  const [fh, fm] = fin.split(':').map(Number)
  const minutes = (fh ?? 0) * 60 + (fm ?? 0) - ((dh ?? 0) * 60 + (dm ?? 0))
  return Math.max(Math.round(minutes / 15) * 15, 0)
}

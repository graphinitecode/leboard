'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/atoms/a-button'
import { Panel, WarningText } from '@/components/atoms'
import { Combobox, EmptyState, type ComboboxOption, ErrorSummary, Input } from '@/components/molecules'
import { QuestionPage, QuestionPageAnswers } from '@/components/templates'
import { ConfirmAction } from '@/components/organisms/o-confirm-action'
import {
  HEURE_DEBUT_GRILLE,
  HEURE_FIN_GRILLE,
  JOURS_GRILLE,
  ajouterSemaines,
  labelSemaine,
  chevaucheUne,
  dateCiblee,
  debutSemaine,
  bornesSemaine,
  joursGrille,
} from '@/calendrier/domain/calendrier.utils'
import type { MatiereCalendrier } from '@/calendrier/domain/calendrier.entity'
import { useCreerSeance, useCreerSerie, useElevesDuProf, useSeancesPeriode } from '@/calendrier'
import { Radios } from '@/components/molecules/m-radios'
import { HORIZON_MOIS, libelleRegle, type FrequenceSerie } from '@/seances/domain/recurrence'
import { nomEleve } from '@/students'
import { EnterText } from '@/components/atoms/a-enter-text'
import { HEURE_FIN_COURS_HHMM, MESSAGE_FIN_COURS } from '@/shared/horaires'

const MATIERES: { label: string; value: MatiereCalendrier }[] = [
  { label: 'Maths', value: 'maths' },
  { label: 'Français', value: 'francais' },
  { label: 'Anglais', value: 'anglais' },
  { label: 'Autre', value: 'autre' },
]

type Etape = 'jour' | 'debut' | 'fin' | 'matiere' | 'eleves' | 'repetition' | 'fin-repetition' | 'recap' | 'confirme'

type Repetition = 'ponctuelle' | FrequenceSerie

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
  const params = useSearchParams()
  const [step, setStep] = useState<Etape>('jour')
  const [erreur, setErreur] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [confirmOuvert, setConfirmOuvert] = useState(false)
  const [eleveIds, setEleveIds] = useState<number[]>([])

  // Préremplissage depuis l'URL (clic-tirer sur le calendrier, bouton d'un jour).
  const initial = useMemo(() => initialiserDepuisParams(params), [params])
  const [lundi, setLundi] = useState(initial.lundi)
  const [jourIndex, setJourIndex] = useState(initial.jourIndex)
  const [heureDebut, setHeureDebut] = useState(initial.heureDebut)
  const [heureFin, setHeureFin] = useState(initial.heureFin)
  const [matiere, setMatiere] = useState<MatiereCalendrier | ''>('')
  const [repetition, setRepetition] = useState<Repetition>('ponctuelle')
  const [finRepetition, setFinRepetition] = useState<'jamais' | 'date'>('jamais')
  const [dateFin, setDateFin] = useState('')

  // Semaine courante : on ne revient pas avant (pas de séance dans le passé)
  const lundiCourant = useMemo(() => debutSemaine(new Date()), [])
  const jourPasse = (index: number) => estPasse(joursGrille(lundi)[index])
  const changerSemaine = (sens: 1 | -1) => {
    const nouveau = ajouterSemaines(lundi, sens)
    setLundi(nouveau)
    // Le jour choisi garde sa place dans la semaine, sauf s'il est déjà passé
    if (estPasse(joursGrille(nouveau)[jourIndex])) setJourIndex(premierJourDisponible(nouveau))
  }
  const { debut, fin } = useMemo(() => bornesSemaine(lundi), [lundi])
  const seances = useSeancesPeriode({ debut, fin })
  const eleves = useElevesDuProf()
  const creer = useCreerSeance()
  const creerSerie = useCreerSerie()
  const optionsEleves = useMemo<ComboboxOption<number>[]>(
    () =>
      (eleves.data ?? []).map((eleve) => ({
        id: `eleve-${eleve.id}`,
        label: nomEleve(eleve),
        sublabel: [eleve.niveau].filter(Boolean).join(' · '),
        disabled: eleveIds.includes(eleve.id),
        value: eleve.id,
      })),
    [eleves.data, eleveIds],
  )

  const events = seances.data ?? []
  const duree = heureDebut && heureFin ? plageMinutes(heureDebut, heureFin) : null
  // Les cours se terminent au plus tard à 18h : début au plus tard à 17h30
  const debutTropTard = Boolean(heureDebut) && heureDebut > `${HEURE_FIN_GRILLE - 1}:30`
  const finTropTard = Boolean(heureFin) && heureFin > HEURE_FIN_COURS_HHMM
  const conflit =
    heureDebut && heureFin
      ? chevaucheUne(
          { debut: dateCiblee(lundi, { jourIndex, heureDebut }), dureeMin: duree ?? 60 },
          events,
        )
      : null

  // Jour choisi au format « YYYY-MM-DD » (date locale) : première occurrence d'une série
  const premiere = jourIso(joursGrille(lundi)[jourIndex])
  const recurrente = repetition !== 'ponctuelle'
  // Étapes : jour, début, fin, matière, élèves, répétition, [fin de répétition], récapitulatif
  const nbEtapes = recurrente ? 8 : 7
  const dateFinInvalide = finRepetition === 'date' && (!dateFin || dateFin < premiere)
  const libelleRepetition = !recurrente
    ? 'Une seule fois'
    : `${libelleRegle(repetition, premiere)}${
        finRepetition === 'date' && dateFin
          ? `, jusqu’au ${new Date(`${dateFin}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
          : ', sans fin'
      }`

  const elevesSelectionnes = (eleves.data ?? []).filter((e) => eleveIds.includes(e.id))
  const nomsEleves = elevesSelectionnes.map(nomEleve)

  const retirerEleve = (id: number) => {
    setErreur([])
    setEleveIds((prev) => prev.filter((eleveId) => eleveId !== id))
  }

  async function valider() {
    if (eleveIds.length === 0 || !heureDebut || !heureFin || matiere === '') return
    setErreur([])
    setPending(true)
    try {
      if (recurrente) {
        await creerSerie.mutateAsync({
          dureeMin: plageMinutes(heureDebut, heureFin),
          eleveIds,
          fin: finRepetition === 'date' ? dateFin : null,
          frequence: repetition,
          heureDebut,
          matiere,
          premiere,
        })
      } else {
        await creer.mutateAsync({
          debut: dateCiblee(lundi, { jourIndex, heureDebut }),
          dureeMin: plageMinutes(heureDebut, heureFin),
          matiere,
          eleveIds,
        })
      }
      setPending(false)
      setConfirmOuvert(false)
      setStep('confirme')
    } catch (err) {
      setErreur([err instanceof Error ? err.message : 'La séance n’a pas pu être créée.'])
      setPending(false)
      setConfirmOuvert(false)
    }
  }

  function recommencer() {
    setStep('jour')
    setJourIndex(premierJourDisponible(lundi))
    setHeureDebut('')
    setHeureFin('')
    setMatiere('')
    setRepetition('ponctuelle')
    setFinRepetition('jamais')
    setDateFin('')
    setEleveIds([])
    setErreur([])
  }

  return (
    <div className="lpv-container">
      {step === 'jour' && (
        <QuestionPage
          actions={
            <Button disabled={jourPasse(jourIndex)} onClick={() => setStep('debut')} type="button" variant="success">
              Continuer
            </Button>
          }
          question="Quel jour se tiendra la séance ?"
          retour={{ href: '/profs', label: 'Retour au Tableau de bord' }}
          htmlFor="seance-jour"
          step={1}
          stepSize={nbEtapes}
        >
          <div className="lpv-o-week-calendar__nav">
            <Button
              ariaLabel="Semaine précédente"
              disabled={lundi.getTime() <= lundiCourant.getTime()}
              onClick={() => changerSemaine(-1)}
              type="button"
              variant="secondary"
            >
              ‹
            </Button>
            <p aria-live="polite" className="lpv-o-week-calendar__label">
              {labelSemaine(lundi)}
            </p>
            <Button ariaLabel="Semaine suivante" onClick={() => changerSemaine(1)} type="button" variant="secondary">
              ›
            </Button>
          </div>
          <div className="lpv-o-availability-wizard__days" id="seance-jour">
            {JOURS_GRILLE.map((label, index) => (
              <button
                className={`lpv-o-availability-wizard__day-option${jourIndex === index ? ' lpv-o-availability-wizard__day-option--active' : ''}`}
                disabled={jourPasse(index)}
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
              disabled={!heureDebut || debutTropTard}
              onClick={() => setStep('fin')}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="À quelle heure commencera cette séance ?"
          retour={{ href: '#', onClick: () => setStep('jour') }}
          htmlFor="seance-debut"
          step={2}
          stepSize={nbEtapes}
        >
          <Input
            hint={`Choisir une heure entre ${HEURE_DEBUT_GRILLE}h et ${HEURE_FIN_GRILLE - 1}h30 : les cours se terminent au plus tard à ${HEURE_FIN_GRILLE}h.`}
            error={debutTropTard ? MESSAGE_FIN_COURS : undefined}
            id="seance-debut"
            label=""
            max={`${HEURE_FIN_GRILLE - 1}:30`}
            min="08:00"
            onChange={(e) => setHeureDebut(e.target.value)}
            type="time"
            value={heureDebut}
          />
        </QuestionPage>
      )}

      {step === 'fin' && (
        <QuestionPage
          actions={
            <Button
              disabled={!heureFin || (duree !== null && duree < 30) || finTropTard}
              onClick={() => setStep('matiere')}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="Cette séance se terminera à quelle heure ?"
          retour={{ href: '#', onClick: () => setStep('debut') }}
          step={3}
          htmlFor="seance-fin"
          stepSize={nbEtapes}
        >
          <Input
            error={finTropTard ? MESSAGE_FIN_COURS : undefined}
            hint={duree ? `Durée : ${formaterDuree(duree)}` : 'Par exemple 14:30'}
            id="seance-fin"
            label=""
            max={HEURE_FIN_COURS_HHMM}
            min={heureDebut || '08:00'}
            onChange={(e) => setHeureFin(e.target.value)}
            type="time"
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
          question="Sur quelle matière portera t-elle ?"
          retour={{ href: '#', onClick: () => setStep('fin') }}
          step={4}
          stepSize={nbEtapes}
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
              onClick={() => {
                if (eleveIds.length === 0) {
                  setErreur(['Choisis au moins un élève'])
                  return
                }
                setErreur([])
                setStep('repetition')
              }}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="Quels sont les élèves conviés ?"
          retour={{ href: '#', onClick: () => setStep('matiere') }}
          step={5}
          stepSize={nbEtapes}
        >
          {erreur.length > 0 && <ErrorSummary errors={erreur} />}
          {eleves.isLoading ? (
            <p className="lpv-muted">Chargement des élèves…</p>
          ) : (eleves.data ?? []).length === 0 ? (
            <EmptyState compact icon="rivet-icons:user" title="Aucun élève relié à votre compte" variant="info" />
          ) : (
            <>
              <Combobox
                ariaLabel="Élèves"
                hint="Tape un prénom ou un nom. Tu peux en choisir plusieurs."
                id="seance-eleve"
                label=""
                onChange={(option) => {
                  setErreur([])
                  const id = option.value
                  setEleveIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
                }}
                options={optionsEleves}
                placeholder="Prénom ou nom…"
              />
              {elevesSelectionnes.length > 0 && (
                <div className="lpv-m-combobox__selection-list">
                  {elevesSelectionnes.map((eleve) => (
                    <div className="lpv-m-combobox__selection" key={eleve.id}>
                      <div className="lpv-m-combobox__selection__content">
                        <div className="lpv-m-combobox__selection__content-label">
                          {nomEleve(eleve)}
                        </div>
                        {eleve.niveau ? (
                          <div className="lpv-m-combobox__selection__content-sub">
                            {eleve.niveau}
                          </div>
                        ) : null}
                      </div>
                      <div
                        className="lpv-link-inline cursor-pointer"
                        onClick={() => retirerEleve(eleve.id)}
                      >
                        Retirer
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </QuestionPage>
      )}

      {step === 'repetition' && (
        <QuestionPage
          actions={
            <Button
              onClick={() => setStep(recurrente ? 'fin-repetition' : 'recap')}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="Cette séance se répète-t-elle ?"
          retour={{ href: '#', onClick: () => setStep('eleves') }}
          step={6}
          stepSize={nbEtapes}
        >
          <Radios
            idPrefix="seance-repetition"
            legendSize="s"
            name="Répétition"
            onChange={(e) => setRepetition(e.target.value as Repetition)}
            options={[
              { label: 'Une seule fois', value: 'ponctuelle' },
              { hint: libelleRegle('hebdomadaire', premiere), label: 'Chaque semaine', value: 'hebdomadaire' },
              { hint: libelleRegle('mensuelle', premiere), label: 'Chaque mois', value: 'mensuelle' },
            ]}
            value={repetition}
          />
        </QuestionPage>
      )}

      {step === 'fin-repetition' && (
        <QuestionPage
          actions={
            <Button disabled={dateFinInvalide} onClick={() => setStep('recap')} type="button" variant="success">
              Continuer
            </Button>
          }
          question="Jusqu’à quand se répète-t-elle ?"
          retour={{ href: '#', onClick: () => setStep('repetition') }}
          step={7}
          stepSize={nbEtapes}
        >
          <Radios
            idPrefix="seance-fin-repetition"
            legendSize="s"
            name="Fin de la répétition"
            onChange={(e) => setFinRepetition(e.target.value as 'jamais' | 'date')}
            options={[
              {
                hint: `Les séances sont prévues sur ${HORIZON_MOIS} mois, puis prolongées automatiquement.`,
                label: 'Jamais',
                value: 'jamais',
              },
              {
                conditional: (
                  <Input
                    error={dateFin && dateFin < premiere ? 'La date de fin doit suivre la première séance.' : undefined}
                    id="seance-date-fin"
                    label="Dernier jour"
                    min={premiere}
                    onChange={(e) => setDateFin(e.target.value)}
                    type="date"
                    value={dateFin}
                  />
                ),
                label: 'Jusqu’à une date',
                value: 'date',
              },
            ]}
            value={finRepetition}
          />
        </QuestionPage>
      )}

      {step === 'recap' && (
        <QuestionPage
          actions={
            <Button
              disabled={pending}
              onClick={() => setConfirmOuvert(true)}
              type="button"
              variant="success"
            >
              {recurrente ? 'Créer les séances' : 'Créer la séance'}
            </Button>
          }
          question="Vérifiez vos réponses"
          retour={{
            href: '#',
            onClick: (e) => {
              e.preventDefault()
              setErreur([])
              setStep(recurrente ? 'fin-repetition' : 'repetition')
            },
          }}
          step={nbEtapes}
          stepSize={nbEtapes}
        >
          {erreur.length > 0 && <ErrorSummary errors={erreur} />}
          <QuestionPageAnswers
            reponses={[
              {
                question: 'Jour',
                valeur: libelleJour(joursGrille(lundi)[jourIndex]),
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
                valeur:
                  elevesSelectionnes.length > 0 ? (
                    <>
                      {elevesSelectionnes.map((eleve) => (
                        <span key={eleve.id} style={{ display: 'block' }}>
                          {nomEleve(eleve)}
                        </span>
                      ))}
                    </>
                  ) : (
                    '—'
                  ),
                onClick: () => setStep('eleves'),
              },
              {
                question: 'Répétition',
                valeur: libelleRepetition,
                onClick: () => setStep('repetition'),
              },
            ]}
            titre=""
          />
          {conflit && (
            <WarningText>
              Cette plage chevauche une séance existante ({labelMatiere(conflit.matiere)} à{' '}
              {conflit.debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              ).
            </WarningText>
          )}
        </QuestionPage>
      )}

      {step === 'confirme' && (
        <QuestionPage question={recurrente ? 'Séances créées' : 'Séance créée'}>
          <Panel
            variante="success"
            title={recurrente ? 'Vos séances sont enregistrées' : 'Votre séance est enregistrée'}
          >
            {libelleJour(joursGrille(lundi)[jourIndex])} · {heureDebut} →{' '}
            {heureFin} · {labelMatiere(matiere)} · {nomsEleves.join(', ') || '—'}
            {recurrente && <> · {libelleRepetition}</>}
          </Panel>

          <div className="lpv-t-question-page__actions">
            <EnterText hrf="/profs">Retour au tableau de bord</EnterText>
            <Button onClick={recommencer} type="button" variant="secondary">
              Créer une autre séance
            </Button>
          </div>
        </QuestionPage>
      )}

      {confirmOuvert && step === 'recap' ? (
        <ConfirmAction
          confirmLabel={recurrente ? 'Créer les séances' : 'Créer la séance'}
          description={`${libelleJour(joursGrille(lundi)[jourIndex])}, ${heureDebut} → ${heureFin}${matiere ? ` · ${labelMatiere(matiere)}` : ''}${nomsEleves.length > 0 ? ` pour ${nomsEleves.join(', ')}` : ''}${recurrente ? ` · ${libelleRepetition}` : ''}. ${recurrente ? 'Ces séances apparaîtront' : 'Cette séance apparaîtra'} dans votre planning.`}
          onClose={() => {
            setConfirmOuvert(false)
            setErreur([])
          }}
          onConfirm={() => {
            void valider()
          }}
          pending={pending}
          pendingLabel="Enregistrement…"
          title={recurrente ? 'Créer ces séances ?' : 'Créer cette séance ?'}
        />
      ) : null}
    </div>
  )
}

// Lecture des paramètres de préremplissage (?date=YYYY-MM-DD&debut=HH:mm&fin=HH:mm) :
// la semaine de la date reçue (celle affichée dans le calendrier), sinon la
// semaine courante ; un jour déjà passé retombe sur le premier jour disponible.
export function initialiserDepuisParams(params: URLSearchParams, maintenant = new Date()): {
  lundi: Date
  jourIndex: number
  heureDebut: string
  heureFin: string
} {
  const dateParam = params.get('date')
  const date =
    dateParam !== null && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? new Date(`${dateParam}T12:00:00`) : null
  const valide = date !== null && !Number.isNaN(date.getTime()) && !estPasse(date, maintenant)
  const lundi = debutSemaine(valide ? date : maintenant)
  return {
    jourIndex: valide ? (date.getDay() + 6) % 7 : premierJourDisponible(lundi, maintenant),
    lundi,
    heureDebut: /^\d{2}:\d{2}$/.test(params.get('debut') ?? '') ? (params.get('debut') as string) : '',
    heureFin: /^\d{2}:\d{2}$/.test(params.get('fin') ?? '') ? (params.get('fin') as string) : '',
  }
}

// Jour antérieur à aujourd'hui (comparaison au jour près, heure ignorée)
function estPasse(jour: Date, maintenant = new Date()): boolean {
  const aMinuit = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return aMinuit(jour) < aMinuit(maintenant)
}

// Premier jour non passé de la semaine (lundi d'une semaine à venir)
function premierJourDisponible(lundi: Date, maintenant = new Date()): number {
  const index = joursGrille(lundi).findIndex((jour) => !estPasse(jour, maintenant))
  return index === -1 ? 0 : index
}

// « Lundi 12 octobre »
function libelleJour(jour: Date): string {
  const texte = jour.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', weekday: 'long' })
  return texte.charAt(0).toUpperCase() + texte.slice(1)
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

// Durées arrondies au quart d'heure (plageMinutes) : libellé parlant.
function formaterDuree(minutes: number): string {
  if (minutes === 15) return "un quart d'heure"
  if (minutes === 30) return 'une demi-heure'
  if (minutes === 45) return "trois quarts d'heure"
  const heures = Math.floor(minutes / 60)
  const reste = minutes % 60
  return reste === 0 ? `${heures}h` : `${heures}h${reste}`
}

// Date locale au format « YYYY-MM-DD »
function jourIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

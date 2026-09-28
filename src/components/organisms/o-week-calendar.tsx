'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/atoms/a-button'
import { Icon } from '@/components/atoms/a-icon'
import { SegmentedToggle } from '@/components/molecules/m-segmented-toggle'
import { Toast } from '@/components/molecules/m-toast'
import {
  HEURE_DEBUT_GRILLE,
  JOURS_GRILLE,
  MINUTES_CRENEAU,
  ajouterJours,
  ajouterSemaines,
  bandeEnMinutes,
  brouillonDepuisPlage,
  bornesSemaine,
  couleurMatiere,
  dateCiblee,
  debutSemaine,
  dureeBornee,
  indexJourGrille,
  joursAvecSeances,
  joursGrille,
  labelSemaine,
  plageDepuisCases,
  positionMinutes,
  rangeesGrille,
  seancesDuJourTriees,
} from '@/calendrier/domain/calendrier.utils'
import type {
  BandeDispo,
  BrouillonSeance,
  CibleCreneau,
  MatiereCalendrier,
  PlageSelectionnee,
  VueCalendrier,
} from '@/calendrier/domain/calendrier.entity'
import {
  useDeplacerSeance,
  useSeancesPeriode,
} from '@/calendrier/application/calendrier.hooks'
import { MonthPicker } from './o-month-picker'

export type WeekCalendarMode = 'prof' | 'parent' | 'demo'

// Vue model minimale attendue par organism (parents : servi côté serveur).
export interface WeekCalendarEvent {
  id: number
  debut: Date
  dureeMin: number
  matiere: MatiereCalendrier
  labelGroupe: string
  href: string
}

const RANGEES = rangeesGrille()
const HAUTEUR_CRENEAU = 44 // px par créneau de 30 min
const PX_PAR_MINUTE = HAUTEUR_CRENEAU / MINUTES_CRENEAU
const CLE_VUE = 'lpv-calendrier-vue'

interface WeekCalendarProps {
  mode: WeekCalendarMode
  // Mode parent/demo : événements fournis (sinon fetch côté prof).
  events?: WeekCalendarEvent[]
  dispos?: BandeDispo[]
  semaineInitiale?: Date
}

export function WeekCalendar(props: WeekCalendarProps) {
  if (props.mode === 'demo') {
    return <WeekCalendarDemo {...props} />
  }
  if (props.mode === 'parent') {
    return <WeekCalendarStatic {...props} />
  }
  return <WeekCalendarProf {...props} />
}

/* ------------------------------------------------------------------ */
/* Vues partagées                                                      */
/* ------------------------------------------------------------------ */

// Préférence de vue partagée par tous les calendriers de la page :
// external store (localStorage). Côté serveur : 'semaine' (snapshot getServerSnapshot),
// évitant tout mismatch d'hydratation.
const VUES: VueCalendrier[] = ['semaine', 'jour', 'liste']
const ecouteurs = new Set<() => void>()

function storeVue(): VueCalendrier {
  const stockee = window.localStorage.getItem(CLE_VUE) as VueCalendrier | null
  return stockee && VUES.includes(stockee) ? stockee : 'semaine'
}

function ecrireVue(v: VueCalendrier) {
  window.localStorage.setItem(CLE_VUE, v)
  ecouteurs.forEach((ecouter) => ecouter())
}

function abonnerVue(notifier: () => void) {
  ecouteurs.add(notifier)
  return () => ecouteurs.delete(notifier)
}

function useVuePreferee(): [VueCalendrier, (v: VueCalendrier) => void] {
  const vue = useSyncExternalStore(
    abonnerVue,
    storeVue,
    () => 'semaine' as VueCalendrier,
  )
  return [vue, ecrireVue]
}

const OPTIONS_VUES = [
  { label: 'Semaine', value: 'semaine', ariaLabel: 'Vue semaine' },
  { label: 'Jour', value: 'jour', ariaLabel: 'Vue jour' },
  { label: 'Liste', value: 'liste', ariaLabel: 'Vue liste condensée' },
]

/* ------------------------------------------------------------------ */
/* Navigation commune                                                  */
/* ------------------------------------------------------------------ */

function Navigation({
  lundi,
  onChanger,
  modeJour,
}: {
  lundi: Date
  onChanger: (nouveau: Date) => void
  modeJour?: boolean
}) {
  return (
    <div className="lpv-o-week-calendar__nav">
      <Button
        ariaLabel="Semaine précédente"
        onClick={() => onChanger(ajouterSemaines(lundi, -1))}
        type="button"
        variant="secondary"
      >
        ‹
      </Button>
      <p aria-live="polite" className="lpv-o-week-calendar__label">
        {labelSemaine(lundi)}
      </p>
      <Button
        ariaLabel="Semaine suivante"
        onClick={() => onChanger(ajouterSemaines(lundi, 1))}
        type="button"
        variant="secondary"
      >
        ›
      </Button>
      <Button onClick={() => onChanger(debutSemaine(new Date()))} type="button" variant="secondary">
        Aujourd’hui
      </Button>
      {modeJour && (
        <div className="lpv-o-week-calendar__nav-jour" aria-live="polite">
          {JOURS_GRILLE.map((label, i) => {
            const jour = joursGrille(lundi)[i]
            return (
              <span className="lpv-o-week-calendar__day-tag" key={label}>
                {label.slice(0, 3)} {jour.getDate()}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Grille semaine (desktop par défaut)                                 */
/* ------------------------------------------------------------------ */

function GrilleSemaine({
  lundi,
  events,
  dispos,
  mode,
  surPlage,
  onDrop,
}: {
  lundi: Date
  events: WeekCalendarEvent[]
  dispos: BandeDispo[]
  mode: WeekCalendarMode
  surPlage?: (plage: PlageSelectionnee) => void
  onDrop?: (cible: CibleCreneau, seanceId: number) => void
}) {
  const jours = joursGrille(lundi)
  const aujourdhui = new Date()

  return (
    <div className="lpv-o-week-calendar__scroller">
      <div aria-label="Semaine" className="lpv-o-week-calendar__grid" role="grid">
        <div className="lpv-o-week-calendar__head" role="row">
          <div className="lpv-o-week-calendar__corner" />
          {jours.map((jour, i) => (
            <div className="lpv-o-week-calendar__day" key={i} role="columnheader">
              {JOURS_GRILLE[i]} {jour.getDate()}
              {jour.toDateString() === aujourdhui.toDateString() && (
                <span className="lpv-o-week-calendar__today-dot" title="Aujourd'hui" />
              )}
            </div>
          ))}
        </div>

        <div className="lpv-o-week-calendar__body">
          <div className="lpv-o-week-calendar__hours">
            {RANGEES.map((heure) => (
              <div className="lpv-o-week-calendar__hour" key={heure} style={{ height: HAUTEUR_CRENEAU }}>
                {heure.endsWith(':00') ? heure : ''}
              </div>
            ))}
          </div>

          {jours.map((jour, jourIndex) => {
            const duJour = events.filter((e) => indexJourGrille(e.debut) === jourIndex)
            return (
              <div className="lpv-o-week-calendar__day-col" key={jour.toISOString()}>
                {dispos
                  .filter((d) => d.jour.toLowerCase() === JOURS_GRILLE[jourIndex]?.toLowerCase())
                  .map((d, i) => {
                    const [debut, fin] = bandeEnMinutes(d)
                    const top = (debut - HEURE_DEBUT_GRILLE * 60) * PX_PAR_MINUTE
                    const height = (fin - debut) * PX_PAR_MINUTE
                    return <div className="lpv-o-week-calendar__dispo" key={i} style={{ top, height }} />
                  })}
                {duJour.map((event) => (
                  <Pastille event={event} key={event.id} mode={mode} />
                ))}
                {mode === 'prof' && (
                  <ColonneSelectable
                    jourIndex={jourIndex}
                    onDrop={onDrop}
                    surPlage={surPlage}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Colonne interactive : cases + sélection de plage                    */
/* ------------------------------------------------------------------ */

function ColonneSelectable({
  jourIndex,
  surPlage,
  onDrop,
}: {
  jourIndex: number
  surPlage?: (plage: PlageSelectionnee) => void
  onDrop?: (cible: CibleCreneau, seanceId: number) => void
}) {
  const [plageEnCours, setPlageEnCours] = useState<PlageSelectionnee | null>(null)
  const [plageSurvolee, setPlageSurvolee] = useState<number | null>(null)

  return (
    <>
      {plageEnCours && <div className="lpv-o-week-calendar__selection" style={styleSelection(plageEnCours)} />}
      {RANGEES.map((heure, rangee) => (
        <button
          aria-label={`Nouvelle séance le ${JOURS_GRILLE[jourIndex]} à ${heure}`}
          className={`lpv-o-week-calendar__slot${plageEnCours && rangee >= plageEnCours.rangeeDebut && rangee < plageEnCours.rangeeFin ? ' lpv-o-week-calendar__slot--active' : ''}`}
          data-heure={heure}
          key={heure}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const id = Number(e.dataTransfer.getData('text/plain'))
            if (Number.isFinite(id) && id > 0) onDrop?.({ jourIndex, heureDebut: heure }, id)
          }}
          onPointerCancel={() => {
            setPlageEnCours(null)
            setPlageSurvolee(null)
          }}
          onPointerDown={(e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return
            e.currentTarget.setPointerCapture(e.pointerId)
            setPlageEnCours({ jourIndex, rangeeDebut: rangee, rangeeFin: rangee + 1 })
          }}
          onPointerEnter={() => setPlageSurvolee(rangee)}
          onPointerMove={() => setPlageSurvolee(rangee)}
          onPointerUp={() => {
            if (plageSurvolee === null) return
            const { rangeeDebut, rangeeFin } = plageDepuisCases(rangee, plageSurvolee)
            setPlageEnCours(null)
            setPlageSurvolee(null)
            surPlage?.({ jourIndex, rangeeDebut, rangeeFin })
          }}
          style={{ top: RANGEES.indexOf(heure) * HAUTEUR_CRENEAU, touchAction: 'none' }}
          type="button"
        />
      ))}
    </>
  )
}

function styleSelection(plage: PlageSelectionnee): React.CSSProperties {
  const top = plage.rangeeDebut * HAUTEUR_CRENEAU
  const height = (plage.rangeeFin - plage.rangeeDebut) * HAUTEUR_CRENEAU
  return { top, height }
}

/* ------------------------------------------------------------------ */
/* Grille d'un jour (vue jour — mobile par défaut)                     */
/* ------------------------------------------------------------------ */

function GrilleJour({
  lundi,
  jourIndex,
  events,
  dispos,
  mode,
  surPlage,
  onDrop,
}: {
  lundi: Date
  jourIndex: number
  events: WeekCalendarEvent[]
  dispos: BandeDispo[]
  mode: WeekCalendarMode
  surPlage?: (plage: PlageSelectionnee) => void
  onDrop?: (cible: CibleCreneau, seanceId: number) => void
}) {
  const jour = joursGrille(lundi)[jourIndex]
  const aujourdhui = new Date()

  return (
    <div className="lpv-o-week-calendar__day-view">
      <div aria-label={JOURS_GRILLE[jourIndex]} className="lpv-o-week-calendar__grid" role="grid">
        <div className="lpv-o-week-calendar__head">
          <div className="lpv-o-week-calendar__corner" />
          <div className="lpv-o-week-calendar__day" role="columnheader">
            {JOURS_GRILLE[jourIndex]} {jour.getDate()}
            {jour.toDateString() === aujourdhui.toDateString() && (
              <span className="lpv-o-week-calendar__today-dot" title="Aujourd'hui" />
            )}
          </div>
        </div>

        <div className="lpv-o-week-calendar__body">
          <div className="lpv-o-week-calendar__hours">
            {RANGEES.map((heure) => (
              <div className="lpv-o-week-calendar__hour" key={heure} style={{ height: HAUTEUR_CRENEAU }}>
                {heure.endsWith(':00') ? heure : ''}
              </div>
            ))}
          </div>

          <div className="lpv-o-week-calendar__day-col">
            {dispos
              .filter((d) => d.jour.toLowerCase() === JOURS_GRILLE[jourIndex]?.toLowerCase())
              .map((d, i) => {
                const [debut, fin] = bandeEnMinutes(d)
                const top = (debut - HEURE_DEBUT_GRILLE * 60) * PX_PAR_MINUTE
                const height = (fin - debut) * PX_PAR_MINUTE
                return <div className="lpv-o-week-calendar__dispo" key={i} style={{ top, height }} />
              })}
            {seancesDuJourTriees(events, jourIndex).map((event) => (
              <Pastille event={event} key={event.id} mode={mode} />
            ))}
            {mode === 'prof' && (
              <ColonneSelectable
                jourIndex={jourIndex}
                onDrop={onDrop}
                surPlage={surPlage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Vue liste condensée                                                 */
/* ------------------------------------------------------------------ */

function VueListe({ events, lundi }: { events: WeekCalendarEvent[]; lundi: Date }) {
  const indices = joursAvecSeances(events)

  if (indices.length === 0) {
    return <p className="lpv-muted">Aucune séance cette semaine.</p>
  }

  return (
    <div className="lpv-o-week-calendar__list">
      {indices.map((jourIndex) => {
        const jour = joursGrille(lundi)[jourIndex]
        const duJour = seancesDuJourTriees(events, jourIndex)
        return (
          <section className="lpv-o-week-calendar__list-day" key={jourIndex}>
            <h3 className="lpv-o-week-calendar__list-title">
              {JOURS_GRILLE[jourIndex]} {jour.getDate()}
            </h3>
            <div className="lpv-card__rows">
              {duJour.map((event) => (
                <a className="lpv-m-list-row" href={event.href || '#'} key={event.id}>
                  <span className="lpv-chip">
                    {event.debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>{' '}
                  <span className="lpv-m-list-row__title">{labelMatiere(event.matiere)}</span>
                  {event.labelGroupe && <span className="lpv-muted">· {event.labelGroupe}</span>}
                </a>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Pastille                                                            */
/* ------------------------------------------------------------------ */

function Pastille({ event, mode }: { event: WeekCalendarEvent; mode: WeekCalendarMode }) {
  const top = positionMinutes(event.debut) * PX_PAR_MINUTE
  const height = Math.max(dureeBornee(event.dureeMin) * PX_PAR_MINUTE - 2, 20)

  return (
    <a
      className={`lpv-o-week-calendar__event lpv-o-week-calendar__event--${couleurMatiere(event.matiere)}`}
      draggable={mode === 'prof'}
      href={event.href || undefined}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(event.id))
        e.dataTransfer.effectAllowed = 'move'
      }}
      style={{ top, height }}
    >
      <span className="lpv-o-week-calendar__event-matiere">{labelMatiere(event.matiere)}</span>
      {event.labelGroupe && (
        <span className="lpv-o-week-calendar__event-groupe">{event.labelGroupe}</span>
      )}
    </a>
  )
}

function labelMatiere(matiere: MatiereCalendrier): string {
  switch (matiere) {
    case 'maths':
      return 'Maths'
    case 'francais':
      return 'Français'
    case 'anglais':
      return 'Anglais'
    default:
      return 'Autre'
  }
}

/* ------------------------------------------------------------------ */
/* Toggle de vues + mini-calendrier                                    */
/* ------------------------------------------------------------------ */

function OutilsVues({
  vue,
  changerVue,
  lundi,
  events,
  onChoisirJour,
}: {
  vue: VueCalendrier
  changerVue: (v: VueCalendrier) => void
  lundi: Date
  events: WeekCalendarEvent[]
  onChoisirJour: (jour: Date) => void
}) {
  const [pickerOuvert, setPickerOuvert] = useState(false)
  const occupes = useMemo(
    () => joursAvecSeances(events).map((i) => joursGrille(lundi)[i]),
    [events, lundi],
  )

  return (
    <div className="lpv-o-week-calendar__tools">
      <SegmentedToggle
        ariaLabel="Choisir la vue du calendrier"
        initialValue={vue}
        onChange={(v) => changerVue(v as VueCalendrier)}
        options={OPTIONS_VUES}
      />
      <Button
        ariaExpanded={pickerOuvert}
        ariaLabel="Afficher le mini-calendrier"
        onClick={() => setPickerOuvert((o) => !o)}
        type="button"
        variant="secondary"
      >
        <Icon icon="rivet-icons:calendar-solid" size={16} />
      </Button>
      {pickerOuvert && (
        <div className="lpv-o-week-calendar__picker-panel">
          <MonthPicker
            joursOccupes={occupes}
            lundi={lundi}
            onChoisirJour={(jour) => {
              onChoisirJour(jour)
              setPickerOuvert(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mode prof : fetch + DnD + sélection de plage + assistant            */
/* ------------------------------------------------------------------ */

function WeekCalendarProf({ dispos = [], semaineInitiale }: WeekCalendarProps) {
  const router = useRouter()
  const [lundi, setLundi] = useState(() => debutSemaine(semaineInitiale ?? new Date()))
  const [vue, changerVue] = useVuePreferee()
  const [jourIndex, setJourIndex] = useState(() => jourDuJour())
  const [toast, setToast] = useState<string | null>(null)

  const { debut, fin } = useMemo(() => bornesSemaine(lundi), [lundi])
  const seances = useSeancesPeriode({ debut, fin })
  const deplacer = useDeplacerSeance()

  const events = seances.data ?? []

  useEffect(() => {
    // En < 48rem, la vue semaine est illisible : forcer la vue jour au montage
    // (écriture du store externe, pas de setState local dans l'effet).
    if (window.matchMedia('(max-width: 47.99rem)').matches) {
      ecrireVue('jour')
    }
  }, [])

  // La sélection de plage (clic-tirer) ouvre le parcours de création sur la
  // page dédiée, avec le jour et les heures préremplis dans l'URL.
  const surPlage = (plage: PlageSelectionnee) => {
    const brouillon = brouillonDepuisPlage(plage)
    router.push(urlNouvelleSeance(lundi, brouillon))
  }

  const surDepot = (cible: CibleCreneau, seanceId: number) => {
    const existante = events.find((e) => e.id === seanceId)
    if (!existante) return
    const nouvelleDate = dateCiblee(lundi, cible)
    deplacer.mutate(
      { seanceId, nouvelleDate, dureeMin: dureeBornee(existante.dureeMin) },
      {
        onError: (err) => setToast(err.message),
      },
    )
  }

  return (
    <div className="lpv-o-week-calendar">
      <div className="lpv-o-week-calendar__toolbar">
        <Button href={urlNouvelleSeance(lundi, vue === 'jour' ? { jourIndex } : null)}>
          + Nouvelle séance
        </Button>
        <OutilsVues
          changerVue={changerVue}
          events={events}
          onChoisirJour={(jour) => {
            const nouveauLundi = debutSemaine(jour)
            setLundi(nouveauLundi)
            setJourIndex(Math.min((jour.getDay() + 6) % 7, 5))
          }}
          lundi={lundi}
          vue={vue}
        />
      </div>

      <Navigation lundi={lundi} modeJour={vue === 'jour'} onChanger={setLundi} />

      {vue === 'jour' && (
        <div className="lpv-o-week-calendar__day-nav">
          <Button
            ariaLabel="Jour précédent"
            onClick={() => {
              const nouveau = ajouterJours(lundi, -1)
              setLundi(debutSemaine(nouveau))
              setJourIndex(Math.min((nouveau.getDay() + 6) % 7, 5))
            }}
            type="button"
            variant="secondary"
          >
            ‹ Jour
          </Button>
          <strong>{JOURS_GRILLE[jourIndex]}</strong>
          <Button
            ariaLabel="Jour suivant"
            onClick={() => {
              const nouveau = ajouterJours(lundi, 1)
              setLundi(debutSemaine(nouveau))
              setJourIndex(Math.min((nouveau.getDay() + 6) % 7, 5))
            }}
            type="button"
            variant="secondary"
          >
            Jour ›
          </Button>
        </div>
      )}

      {seances.isLoading ? (
        <p className="lpv-muted">Chargement de la semaine…</p>
      ) : vue === 'semaine' ? (
        <GrilleSemaine
          dispos={dispos}
          events={events}
          lundi={lundi}
          mode="prof"
          onDrop={surDepot}
          surPlage={surPlage}
        />
      ) : vue === 'jour' ? (
        <GrilleJour
          dispos={dispos}
          events={events}
          jourIndex={jourIndex}
          lundi={lundi}
          mode="prof"
          onDrop={surDepot}
          surPlage={surPlage}
        />
      ) : (
        <VueListe events={events} lundi={lundi} />
      )}

      {events.length === 0 && !seances.isLoading && vue === 'semaine' && (
        <p className="lpv-muted">Aucune séance cette semaine.</p>
      )}
      {toast && <Toast message={toast} type="error" onClose={() => setToast(null)} />}
    </div>
  )
}

function jourDuJour(): number {
  return Math.min((new Date().getDay() + 6) % 7, 5)
}

// URL du parcours de création avec préremplissage (jour 1..6 de la semaine
// courante affichée + heures optionnels).
function urlNouvelleSeance(lundi: Date, brouillon: BrouillonSeance | null): string {
  const params = new URLSearchParams()
  const date = brouillon?.jourIndex !== undefined ? joursGrille(lundi)[brouillon.jourIndex] : lundi
  params.set('date', date.toISOString().slice(0, 10))
  if (brouillon?.heureDebut) params.set('debut', brouillon.heureDebut)
  if (brouillon?.heureFin) params.set('fin', brouillon.heureFin)
  return `/profs/seances/nouvelle?${params.toString()}`
}

/* ------------------------------------------------------------------ */
/* Modes statiques (parent, demo) avec vues                            */
/* ------------------------------------------------------------------ */

function WeekCalendarStatic({ events = [], dispos = [], semaineInitiale }: WeekCalendarProps) {
  const [lundi, setLundi] = useState(() => debutSemaine(semaineInitiale ?? new Date()))
  const [vue, changerVue] = useVuePreferee()
  const [jourIndex, setJourIndex] = useState(jourDuJour)

  return (
    <div className="lpv-o-week-calendar">
      <div className="lpv-o-week-calendar__toolbar">
        <OutilsVues
          changerVue={changerVue}
          events={events}
          lundi={lundi}
          onChoisirJour={(jour) => {
            const nouveauLundi = debutSemaine(jour)
            setLundi(nouveauLundi)
            setJourIndex(Math.min((jour.getDay() + 6) % 7, 5))
          }}
          vue={vue}
        />
      </div>
      <Navigation lundi={lundi} modeJour={vue === 'jour'} onChanger={setLundi} />

      {vue === 'jour' && (
        <div className="lpv-o-week-calendar__day-nav">
          <Button
            ariaLabel="Jour précédent"
            onClick={() => {
              const nouveau = ajouterJours(lundi, -1)
              setLundi(debutSemaine(nouveau))
              setJourIndex(Math.min((nouveau.getDay() + 6) % 7, 5))
            }}
            type="button"
            variant="secondary"
          >
            ‹ Jour
          </Button>
          <strong>{JOURS_GRILLE[jourIndex]}</strong>
          <Button
            ariaLabel="Jour suivant"
            onClick={() => {
              const nouveau = ajouterJours(lundi, 1)
              setLundi(debutSemaine(nouveau))
              setJourIndex(Math.min((nouveau.getDay() + 6) % 7, 5))
            }}
            type="button"
            variant="secondary"
          >
            Jour ›
          </Button>
        </div>
      )}

      {vue === 'semaine' ? (
        <GrilleSemaine dispos={dispos} events={events} lundi={lundi} mode="parent" />
      ) : vue === 'jour' ? (
        <GrilleJour dispos={dispos} events={events} jourIndex={jourIndex} lundi={lundi} mode="parent" />
      ) : (
        <VueListe events={events} lundi={lundi} />
      )}
      {vue === 'semaine' && events.length === 0 && (
        <p className="lpv-muted">Aucune séance cette semaine.</p>
      )}
      {vue === 'jour' && seancesDuJourTriees(events, jourIndex).length === 0 && (
        <p className="lpv-muted">Aucune séance ce jour.</p>
      )}
    </div>
  )
}

const EVENTS_DEMO: WeekCalendarEvent[] = [
  {
    id: 1,
    debut: new Date(2025, 8, 22, 14, 0),
    dureeMin: 60,
    matiere: 'maths',
    labelGroupe: 'Maths-3e',
    href: '#demo',
  },
  {
    id: 2,
    debut: new Date(2025, 8, 24, 16, 0),
    dureeMin: 60,
    matiere: 'francais',
    labelGroupe: '6e',
    href: '#demo',
  },
  {
    id: 3,
    debut: new Date(2025, 8, 25, 15, 0),
    dureeMin: 90,
    matiere: 'anglais',
    labelGroupe: '5e',
    href: '#demo',
  },
]

const DISPOS_DEMO: BandeDispo[] = [{ jour: 'vendredi', heureDebut: '17:00', heureFin: '19:00' }]

function WeekCalendarDemo(props: WeekCalendarProps) {
  return (
    <WeekCalendarStatic
      {...props}
      events={props.events ?? EVENTS_DEMO}
      dispos={props.dispos ?? DISPOS_DEMO}
      semaineInitiale={props.semaineInitiale ?? new Date(2025, 8, 22)}
    />
  )
}

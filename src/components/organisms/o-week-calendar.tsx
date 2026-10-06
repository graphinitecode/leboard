'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/atoms/a-button'
import { Icon } from '@/components/atoms/a-icon'
import { SegmentedToggle } from '@/components/molecules/m-segmented-toggle'
import { Toast } from '@/components/molecules/m-toast'
import {
  HEURE_DEBUT_GRILLE,
  JOURS_GRILLE,
  MINUTES_CRENEAU,
  ajouterSemaines,
  bandeEnMinutes,
  brouillonDepuisPlage,
  bornesSemaine,
  couleurMatiere,
  dateCiblee,
  depasseFinCours,
  debutSemaine,
  dureeBornee,
  dureeRedimensionnee,
  indexJourGrille,
  joursAvecSeances,
  joursGrille,
  jourVoisin,
  labelDuree,
  labelSemaine,
  HEURE_FIN_GRILLE,
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
import { MESSAGE_FIN_COURS } from '@/shared/horaires'
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

type SurRedimension = (seanceId: number, dureeMin: number, terminer: () => void) => void

const RANGEES = rangeesGrille()
const HAUTEUR_CRENEAU = 44 // px par créneau de 30 min
const PX_PAR_MINUTE = HAUTEUR_CRENEAU / MINUTES_CRENEAU
const CLE_VUE = 'lpv-calendrier-vue'

// Glisser-déposer d'une pastille en cours : les cases de création ignorent
// alors le pointeur (un dépôt ne doit jamais ouvrir la création)
let glissementEnCours = false

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

  useEffect(() => {
    // En < 48rem, la grille semaine est illisible : vue jour au montage, pour
    // tous les modes (prof comme parent). Écriture du store externe, pas de
    // setState local dans l'effet.
    if (window.matchMedia?.('(max-width: 47.99rem)').matches && storeVue() === 'semaine') {
      ecrireVue('jour')
    }
  }, [])

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

// Navigation jour par jour (vue jour) : part du jour affiché.
function NavigationJour({
  lundi,
  jourIndex,
  onChanger,
}: {
  lundi: Date
  jourIndex: number
  onChanger: (voisin: { lundi: Date; jourIndex: number }) => void
}) {
  return (
    <div className="lpv-o-week-calendar__day-nav">
      <Button
        ariaLabel="Jour précédent"
        onClick={() => onChanger(jourVoisin(lundi, jourIndex, -1))}
        type="button"
        variant="secondary"
      >
        ‹ Jour
      </Button>
      <strong>{JOURS_GRILLE[jourIndex]}</strong>
      <Button
        ariaLabel="Jour suivant"
        onClick={() => onChanger(jourVoisin(lundi, jourIndex, 1))}
        type="button"
        variant="secondary"
      >
        Jour ›
      </Button>
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
  onResize,
}: {
  lundi: Date
  events: WeekCalendarEvent[]
  dispos: BandeDispo[]
  mode: WeekCalendarMode
  surPlage?: (plage: PlageSelectionnee) => void
  onDrop?: (cible: CibleCreneau, seanceId: number) => void
  onResize?: SurRedimension
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
                <LignesHeures />
                {dispos
                  .filter((d) => d.jour.toLowerCase() === JOURS_GRILLE[jourIndex]?.toLowerCase())
                  .map((d, i) => {
                    const [debut, fin] = bandeEnMinutes(d)
                    const top = (debut - HEURE_DEBUT_GRILLE * 60) * PX_PAR_MINUTE
                    const height = (fin - debut) * PX_PAR_MINUTE
                    return <div className="lpv-o-week-calendar__dispo" key={i} style={{ top, height }} />
                  })}
                {duJour.map((event) => (
                  <Pastille event={event} key={event.id} mode={mode} onResize={onResize} />
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
  // Case d'appui : la sélection n'existe que si elle a commencé ici (un
  // simple survol suivi d'un relâchement n'ouvre jamais la création)
  const rangeeAppui = useRef<number | null>(null)

  // Le pointeur est capturé par la case d'appui : la rangée survolée se
  // déduit de sa position dans la colonne, pas de la case qui reçoit l'événement
  const rangeeSousPointeur = (e: React.PointerEvent<HTMLElement>): number => {
    const colonne = e.currentTarget.parentElement?.getBoundingClientRect()
    const rangee = Math.floor((e.clientY - (colonne?.top ?? 0)) / HAUTEUR_CRENEAU)
    return Math.min(Math.max(rangee, 0), RANGEES.length - 1)
  }

  const annuler = () => {
    rangeeAppui.current = null
    setPlageEnCours(null)
  }

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
            annuler()
            const id = Number(e.dataTransfer.getData('text/plain'))
            if (Number.isFinite(id) && id > 0) onDrop?.({ jourIndex, heureDebut: heure }, id)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') annuler()
          }}
          onPointerCancel={annuler}
          onPointerDown={(e) => {
            if (glissementEnCours || (e.pointerType === 'mouse' && e.button !== 0)) return
            e.currentTarget.setPointerCapture(e.pointerId)
            rangeeAppui.current = rangee
            setPlageEnCours({ jourIndex, rangeeDebut: rangee, rangeeFin: rangee + 1 })
          }}
          onPointerMove={(e) => {
            if (rangeeAppui.current === null) return
            setPlageEnCours({ jourIndex, ...plageDepuisCases(rangeeAppui.current, rangeeSousPointeur(e)) })
          }}
          onPointerUp={(e) => {
            const appui = rangeeAppui.current
            annuler()
            if (appui === null || glissementEnCours) return
            surPlage?.({ jourIndex, ...plageDepuisCases(appui, rangeeSousPointeur(e)) })
          }}
          style={{ top: rangee * HAUTEUR_CRENEAU, touchAction: 'none' }}
          type="button"
        />
      ))}
    </>
  )
}

// Lignes horizontales en pointillés à chaque heure : repères pour viser un
// créneau pendant un glisser-déposer ou une sélection
function LignesHeures() {
  const heures = HEURE_FIN_GRILLE - HEURE_DEBUT_GRILLE
  return (
    <>
      {Array.from({ length: heures - 1 }, (_, i) => (
        <div
          aria-hidden="true"
          className="lpv-o-week-calendar__hour-line"
          key={i}
          style={{ top: (i + 1) * 2 * HAUTEUR_CRENEAU }}
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
  onResize,
}: {
  lundi: Date
  jourIndex: number
  events: WeekCalendarEvent[]
  dispos: BandeDispo[]
  mode: WeekCalendarMode
  surPlage?: (plage: PlageSelectionnee) => void
  onDrop?: (cible: CibleCreneau, seanceId: number) => void
  onResize?: SurRedimension
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
            <LignesHeures />
            {dispos
              .filter((d) => d.jour.toLowerCase() === JOURS_GRILLE[jourIndex]?.toLowerCase())
              .map((d, i) => {
                const [debut, fin] = bandeEnMinutes(d)
                const top = (debut - HEURE_DEBUT_GRILLE * 60) * PX_PAR_MINUTE
                const height = (fin - debut) * PX_PAR_MINUTE
                return <div className="lpv-o-week-calendar__dispo" key={i} style={{ top, height }} />
              })}
            {seancesDuJourTriees(events, jourIndex).map((event) => (
              <Pastille event={event} key={event.id} mode={mode} onResize={onResize} />
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
                  <span className="lpv-m-list-row__title">{labelMatiere(event.matiere)}</span>{' '}
                  <span className="lpv-muted">({labelDuree(dureeBornee(event.dureeMin))})</span>
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

function Pastille({
  event,
  mode,
  onResize,
}: {
  event: WeekCalendarEvent
  mode: WeekCalendarMode
  onResize?: SurRedimension
}) {
  const dureeInitiale = dureeBornee(event.dureeMin)
  // Durée affichée pendant le redimensionnement, jusqu'au rechargement des séances
  const [dureeApercu, setDureeApercu] = useState<number | null>(null)
  const appuiPoignee = useRef<number | null>(null)

  const duree = dureeApercu ?? dureeInitiale
  const top = positionMinutes(event.debut) * PX_PAR_MINUTE
  const height = Math.max(duree * PX_PAR_MINUTE - 2, 20)
  const fin = new Date(event.debut.getTime() + duree * 60_000)
  const redimensionnable = mode === 'prof' && Boolean(onResize)

  const dureeSousPointeur = (clientY: number) =>
    dureeRedimensionnee(event.debut, dureeInitiale, (clientY - (appuiPoignee.current ?? clientY)) / PX_PAR_MINUTE)

  return (
    <a
      className={`lpv-o-week-calendar__event lpv-o-week-calendar__event--${couleurMatiere(event.matiere)}${dureeApercu !== null ? ' lpv-o-week-calendar__event--resizing' : ''}`}
      draggable={mode === 'prof'}
      href={event.href || undefined}
      onDragEnd={(e) => {
        e.currentTarget.closest('.lpv-o-week-calendar')?.classList.remove('lpv-o-week-calendar--dragging')
        // Après le dépôt : un relâchement tardif sur une case reste ignoré
        setTimeout(() => {
          glissementEnCours = false
        }, 0)
      }}
      onDragStart={(e) => {
        if (appuiPoignee.current !== null) {
          e.preventDefault()
          return
        }
        glissementEnCours = true
        e.dataTransfer.setData('text/plain', String(event.id))
        e.dataTransfer.effectAllowed = 'move'
        // Différé : modifier le DOM pendant dragstart annule le glissement (Chrome)
        const calendrier = e.currentTarget.closest('.lpv-o-week-calendar')
        setTimeout(() => calendrier?.classList.add('lpv-o-week-calendar--dragging'), 0)
      }}
      style={{ top, height }}
    >
      <span className="lpv-o-week-calendar__event-matiere">{labelMatiere(event.matiere)}</span>
      <span className="lpv-o-week-calendar__event-horaire">
        {heureCourte(event.debut)} – {heureCourte(fin)} · {labelDuree(duree)}
      </span>
      {event.labelGroupe && (
        <span className="lpv-o-week-calendar__event-groupe">{event.labelGroupe}</span>
      )}
      {redimensionnable && (
        <span
          aria-hidden="true"
          className="lpv-o-week-calendar__event-resize"
          draggable={false}
          // Le clic qui suit le relâchement ne doit pas ouvrir la séance
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onPointerCancel={() => {
            appuiPoignee.current = null
            setDureeApercu(null)
          }}
          onPointerDown={(e) => {
            // Empêche le glisser-déposer natif de la pastille
            e.preventDefault()
            e.stopPropagation()
            e.currentTarget.setPointerCapture(e.pointerId)
            appuiPoignee.current = e.clientY
            setDureeApercu(dureeInitiale)
          }}
          onPointerMove={(e) => {
            if (appuiPoignee.current === null) return
            setDureeApercu(dureeSousPointeur(e.clientY))
          }}
          onPointerUp={(e) => {
            if (appuiPoignee.current === null) return
            const nouvelleDuree = dureeSousPointeur(e.clientY)
            appuiPoignee.current = null
            if (nouvelleDuree === dureeInitiale) {
              setDureeApercu(null)
              return
            }
            onResize?.(event.id, nouvelleDuree, () => setDureeApercu(null))
          }}
          title="Glisser pour changer la durée"
        />
      )}
    </a>
  )
}

function heureCourte(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
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

  // La sélection de plage (clic-tirer) ouvre le parcours de création sur la
  // page dédiée, avec le jour et les heures préremplis dans l'URL.
  const surPlage = (plage: PlageSelectionnee) => {
    const brouillon = brouillonDepuisPlage(plage)
    router.push(urlNouvelleSeance(lundi, brouillon))
  }

  const surRedimension: SurRedimension = (seanceId, dureeMin, terminer) => {
    const existante = events.find((e) => e.id === seanceId)
    if (!existante) return terminer()
    deplacer.mutate(
      { seanceId, nouvelleDate: existante.debut, dureeMin },
      {
        onError: (err) => setToast(err.message),
        onSettled: terminer,
      },
    )
  }

  const surDepot = (cible: CibleCreneau, seanceId: number) => {
    const existante = events.find((e) => e.id === seanceId)
    if (!existante) return
    const nouvelleDate = dateCiblee(lundi, cible)
    if (depasseFinCours(nouvelleDate, dureeBornee(existante.dureeMin))) {
      setToast(MESSAGE_FIN_COURS)
      return
    }
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
            setJourIndex((jour.getDay() + 6) % 7)
          }}
          lundi={lundi}
          vue={vue}
        />
      </div>

      <Navigation lundi={lundi} modeJour={vue === 'jour'} onChanger={setLundi} />

      {vue === 'jour' && (
        <NavigationJour
          jourIndex={jourIndex}
          lundi={lundi}
          onChanger={(voisin) => {
            setLundi(voisin.lundi)
            setJourIndex(voisin.jourIndex)
          }}
        />
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
          onResize={surRedimension}
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
          onResize={surRedimension}
          surPlage={surPlage}
        />
      ) : (
        <VueListe events={events} lundi={lundi} />
      )}

      {events.length === 0 && !seances.isLoading && vue === 'semaine' && (
        <p className="lpv-muted">Aucune séance cette semaine.</p>
      )}
      {!seances.isLoading && vue === 'jour' && seancesDuJourTriees(events, jourIndex).length === 0 && (
        <p className="lpv-muted">Aucune séance ce jour.</p>
      )}
      {toast && <Toast message={toast} type="error" onClose={() => setToast(null)} />}
    </div>
  )
}

function jourDuJour(): number {
  return (new Date().getDay() + 6) % 7
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
            setJourIndex((jour.getDay() + 6) % 7)
          }}
          vue={vue}
        />
      </div>
      <Navigation lundi={lundi} modeJour={vue === 'jour'} onChanger={setLundi} />

      {vue === 'jour' && (
        <NavigationJour
          jourIndex={jourIndex}
          lundi={lundi}
          onChanger={(voisin) => {
            setLundi(voisin.lundi)
            setJourIndex(voisin.jourIndex)
          }}
        />
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

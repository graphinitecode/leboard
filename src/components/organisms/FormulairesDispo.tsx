'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import { BackLink } from '@/components/atoms/BackLink'
import { Bouton } from '@/components/atoms/Bouton'
import { ChampFormulaire, NotificationBanner, ResumeErreurs } from '@/components/molecules'

import {
  ajouterDisponibilite,
  modifierDisponibilite,
  supprimerDisponibilite,
} from '@/app/(frontend)/profs/disponibilites/actions'

export interface DispoItem {
  jour: string
  heureDebut: string
  heureFin: string
}

const OPTIONS_JOUR = [
  { label: 'Lundi', value: 'lundi' },
  { label: 'Mardi', value: 'mardi' },
  { label: 'Mercredi', value: 'mercredi' },
  { label: 'Jeudi', value: 'jeudi' },
  { label: 'Vendredi', value: 'vendredi' },
  { label: 'Samedi', value: 'samedi' },
]

function cleDispo(dispo: DispoItem): string {
  return `${dispo.jour}|${dispo.heureDebut}|${dispo.heureFin}`
}

// Molécule : toast pleine largeur en haut de l'écran, disparition après 5s.
function Toast({ message, type }: { message: string; type: 'succes' | 'erreur' }) {
  return (
    <div className={`lpv-toast${type === 'erreur' ? ' lpv-toast--erreur' : ''}`} role="status">
      {message}
    </div>
  )
}

// Molécule : modale de confirmation de suppression (accessible, Escape ferme).
function ModaleSuppression({
  dispo,
  annuler,
  confirmer,
  pending,
}: {
  dispo: DispoItem
  annuler: () => void
  confirmer: () => void
  pending: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const boutonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    boutonRef.current?.focus()
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') annuler()
    }
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('keydown', escape)
    }
  }, [annuler])

  return (
    <div
      className="lpv-modale-fond"
      onClick={(e) => {
        if (!ref.current?.contains(e.target as Node)) annuler()
      }}
    >
      <div
        aria-labelledby="modale-suppression-titre"
        aria-modal="true"
        className="lpv-modale"
        ref={ref}
        role="dialog"
      >
        <h2 className="lpv-modale__titre" id="modale-suppression-titre">
          Supprimer cette disponibilité ?
        </h2>
        <p className="lpv-modale__texte">
          {dispo.jour} · {dispo.heureDebut} → {dispo.heureFin} — cette action est définitive.
        </p>
        <div className="lpv-modale__actions">
          <Bouton onClick={annuler} type="button" variante="secondaire">
            Annuler
          </Bouton>
          <Bouton disabled={pending} onClick={confirmer} type="button" variante="danger">
            {pending ? 'Suppression…' : 'Supprimer'}
          </Bouton>
        </div>
      </div>
    </div>
  )
}

// Organisme : liste des disponibilités (summary-list GOV.UK) + modale + toast.
// Actions par row : Modifier (ré-ouvre l'assistant pré-rempli) et Supprimer (modale).
export function ListeDispos({ dispos }: { dispos: DispoItem[] }) {
  const [pending, startTransition] = useTransition()
  const [cibleSuppression, setCibleSuppression] = useState<DispoItem | null>(null)
  const [cibleEdition, setCibleEdition] = useState<DispoItem | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'succes' | 'erreur' } | null>(null)
  const [cleNouvelle, setCleNouvelle] = useState<string | null>(null)
  const [assistantOuvert, setAssistantOuvert] = useState(false)
  const timerToast = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerAnimation = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Nettoie les timers au démontage
  useEffect(() => {
    return () => {
      if (timerToast.current) clearTimeout(timerToast.current)
      if (timerAnimation.current) clearTimeout(timerAnimation.current)
    }
  }, [])

  function afficherToast(message: string, type: 'succes' | 'erreur') {
    if (timerToast.current) clearTimeout(timerToast.current)
    setToast({ message, type })
    timerToast.current = setTimeout(() => setToast(null), 5000)
  }

  function supprimer() {
    if (!cibleSuppression) return
    const { jour, heureDebut, heureFin } = cibleSuppression
    setCibleSuppression(null)
    startTransition(async () => {
      const result = await supprimerDisponibilite(jour, heureDebut, heureFin)
      if (result.ok) {
        afficherToast('Disponibilité supprimée', 'succes')
      } else {
        afficherToast(result.erreur ?? 'Échec de la suppression.', 'erreur')
      }
    })
  }

  function enregistré(dispo: DispoItem, precedente: DispoItem | null) {
    if (timerAnimation.current) clearTimeout(timerAnimation.current)
    setCleNouvelle(cleDispo(dispo))
    timerAnimation.current = setTimeout(() => setCleNouvelle(null), 2000)
    afficherToast(precedente ? 'Disponibilité modifiée' : 'Disponibilité ajoutée', 'succes')
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      {cibleSuppression && (
        <ModaleSuppression
          annuler={() => setCibleSuppression(null)}
          confirmer={supprimer}
          dispo={cibleSuppression}
          pending={pending}
        />
      )}
      <p style={{ marginTop: 0 }}>
        <Bouton onClick={() => setAssistantOuvert(true)} type="button">
          + Ajouter un horaire
        </Bouton>
      </p>
      {dispos.length > 0 && (
        <dl className="lpv-summary-list lpv-summary-list--dispos">
          {dispos.map((dispo, index) => (
            <div
              className={
                cleDispo(dispo) === cleNouvelle
                  ? 'lpv-summary-list__row lpv-table__nouvelle'
                  : 'lpv-summary-list__row'
              }
              key={`${cleDispo(dispo)}-${index}`}
            >
              <dt className="lpv-summary-list__key">{dispo.jour}</dt>
              <dd className="lpv-summary-list__value" style={{ margin: 0 }}>
                {dispo.heureDebut} → {dispo.heureFin}
              </dd>
              <dd className="lpv-summary-list__actions" style={{ margin: 0 }}>
                <ul className="lpv-summary-list__actions-list">
                  <li className="lpv-summary-list__actions-list-item">
                    <button
                      aria-label={`Modifier la disponibilité du ${dispo.jour}`}
                      disabled={pending}
                      onClick={() => {
                        setCibleEdition(dispo)
                        setAssistantOuvert(true)
                      }}
                      type="button"
                    >
                      Modifier
                    </button>
                  </li>
                  <li className="lpv-summary-list__actions-list-item">
                    <button
                      aria-label={`Supprimer la disponibilité du ${dispo.jour}`}
                      className="lpv-action--danger"
                      disabled={pending}
                      onClick={() => setCibleSuppression(dispo)}
                      type="button"
                    >
                      Supprimer
                    </button>
                  </li>
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      )}
      <FormulaireDispoSteps
        editionDe={cibleEdition}
        onFerme={() => {
          setAssistantOuvert(false)
          setCibleEdition(null)
        }}
        onEnregistre={enregistré}
        ouvert={assistantOuvert}
      />
    </>
  )
}

// Organisme : assistant d'ajout en 3 écrans.
// Écran 1 : jour (boutons de choix) — Écran 2 : heure de début —
// Écran 3 : heure de fin + récapitulatif, Valider (bleu) ou Modifier (orange).
export function FormulaireDispoSteps({
  ouvert,
  onFerme,
  onEnregistre,
  editionDe,
}: {
  ouvert: boolean
  onFerme: () => void
  onEnregistre?: (dispo: DispoItem, precedente: DispoItem | null) => void
  editionDe?: DispoItem | null
}) {
  const [etape, setEtape] = useState(1)
  const [jour, setJour] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [pending, startTransition] = useTransition()
  const [erreur, setErreur] = useState<string | null>(null)
  const [precedente, setPrecedente] = useState<DispoItem | null>(null)

  // Passage en mode édition : pré-remplit les valeurs de la dispo ciblée
  useEffect(() => {
    if (ouvert && editionDe) {
      setEtape(1)
      setJour(editionDe.jour)
      setHeureDebut(editionDe.heureDebut)
      setHeureFin(editionDe.heureFin)
      setPrecedente(editionDe)
      setErreur(null)
    }
  }, [ouvert, editionDe])

  function reinitialiser() {
    onFerme()
    setEtape(1)
    setJour('')
    setHeureDebut('')
    setHeureFin('')
    setErreur(null)
    setPrecedente(null)
  }

  function valider() {
    setErreur(null)
    startTransition(async () => {
      const nouveau = { heureDebut, heureFin, jour }

      if (precedente) {
        const result = await modifierDisponibilite(precedente, nouveau)
        if (result.ok) {
          setEtape(1)
          setJour('')
          setHeureDebut('')
          setHeureFin('')
          setPrecedente(null)
          onFerme()
          onEnregistre?.(nouveau, precedente)
        } else {
          setErreur(result.erreur ?? 'La disponibilité n’a pas pu être modifiée.')
        }
        return
      }

      const formData = new FormData()
      formData.set('jour', jour)
      formData.set('heureDebut', heureDebut)
      formData.set('heureFin', heureFin)
      const result = await ajouterDisponibilite(formData)
      if (result.ok) {
        setEtape(1)
        setJour('')
        setHeureDebut('')
        setHeureFin('')
        onFerme()
        onEnregistre?.(nouveau, null)
      } else {
        setErreur(result.erreur ?? 'La disponibilité n’a pas pu être enregistrée.')
      }
    })
  }

  if (!ouvert) return null

  const libelleJour = OPTIONS_JOUR.find((o) => o.value === jour)?.label ?? jour
  const enEdition = Boolean(precedente)

  return (
    <div className="lpv-card" style={{ marginTop: '1.5rem' }}>
      {etape === 1 && (
        <>
          <p className="lpv-stepper__etape">Étape 1 sur 3</p>
          <h2 className="lpv-stepper__question">
            {enEdition ? 'Quel jour pour cet horaire ?' : 'Quel jour vous convient ?'}
          </h2>
          <div className="lpv-choix-jour">
            {OPTIONS_JOUR.map((option) => (
              <button
                className={`lpv-choix-jour__option${jour === option.value ? ' lpv-choix-jour__option--actif' : ''}`}
                key={option.value}
                onClick={() => setJour(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="lpv-stepper__actions">
            <Bouton disabled={!jour} onClick={() => setEtape(2)} type="button">
              Continuer
            </Bouton>
            <Bouton onClick={reinitialiser} type="button" variante="secondaire">
              Annuler
            </Bouton>
          </div>
        </>
      )}

      {etape === 2 && (
        <>
          <BackLink href="#" onClick={(e) => { e.preventDefault(); setErreur(null); setEtape(1) }}>Retour</BackLink>
          <p className="lpv-stepper__etape">Étape 2 sur 3</p>
          <h2 className="lpv-stepper__question">Quelle heure de début ?</h2>
          <ChampFormulaire
            hint={`Début du créneau le ${libelleJour.toLowerCase()}.`}
            id="step-debut"
            label="De"
            max="22:00"
            min="08:00"
            onChange={(e) => setHeureDebut(e.target.value)}
            type="time"
            value={heureDebut}
          />
          {erreur && <ResumeErreurs erreurs={[erreur]} />}
          <div className="lpv-stepper__actions">
            <Bouton
              disabled={!heureDebut}
              onClick={() => {
                setErreur(null)
                setEtape(3)
              }}
              type="button"
            >
              Continuer
            </Bouton>
            <Bouton onClick={reinitialiser} type="button" variante="secondaire">
              Annuler
            </Bouton>
          </div>
        </>
      )}

      {etape === 3 && (
        <>
          <BackLink href="#" onClick={(e) => { e.preventDefault(); setErreur(null); setEtape(2) }}>Retour</BackLink>
          <p className="lpv-stepper__etape">Étape 3 sur 3</p>
          <h2 className="lpv-stepper__question">Quelle heure de fin ?</h2>
          <ChampFormulaire
            hint={`Fin du créneau le ${libelleJour.toLowerCase()}.`}
            id="step-fin"
            label="À"
            max="22:00"
            min={heureDebut || '08:00'}
            onChange={(e) => setHeureFin(e.target.value)}
            type="time"
            value={heureFin}
          />
          <div className="lpv-recap" style={{ marginTop: '1rem' }}>
            <div className="lpv-recap__ligne">
              <span className="lpv-recap__cle">Récapitulatif</span>
              <span>
                <strong>{libelleJour}</strong> · {heureDebut} → {heureFin || '…'}
              </span>
            </div>
          </div>
          {erreur && <ResumeErreurs erreurs={[erreur]} />}
          <div className="lpv-stepper__actions">
            <Bouton disabled={!heureFin || pending} onClick={valider} type="button">
              {pending ? 'Enregistrement…' : enEdition ? 'Enregistrer la modification' : 'Valider'}
            </Bouton>
            <Bouton onClick={() => setEtape(1)} type="button" variante="avertissement">
              Modifier
            </Bouton>
            <Bouton onClick={reinitialiser} type="button" variante="secondaire">
              Annuler
            </Bouton>
          </div>
        </>
      )}
    </div>
  )
}

// Gardé pour compat : bannière de succès inline (ancien FormDispo)
export function NotificationDispo({ message }: { message: string }) {
  return <NotificationBanner titre={message} type="succes" />
}
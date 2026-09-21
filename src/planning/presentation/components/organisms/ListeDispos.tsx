'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import { BackLink } from '@/components/atoms/BackLink'
import { Bouton } from '@/components/atoms/Bouton'
import { ChampFormulaire, Modale, NotificationBanner, ResumeErreurs, SummaryList, Toast } from '@/components/molecules'
import type { ActionSummaryList } from '@/components/molecules'

import {
  useAjouterDisponibilite,
  useModifierDisponibilite,
  useSupprimerDisponibilite,
} from '@/planning/application/planning.hooks'
import type { Disponibilite, JourSemaine } from '@/planning/domain/disponibilite.entity'

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

// Organisme : liste des disponibilités (summary-list GOV.UK) + modale + toast.
// Actions par row : Modifier (ré-ouvre l'assistant pré-rempli) et Supprimer (modale).
export function ListeDispos({ dispos }: { dispos: DispoItem[] }) {
  const [pending, startTransition] = useTransition()
  const [cibleSuppression, setCibleSuppression] = useState<DispoItem | null>(null)
  const [cibleEdition, setCibleEdition] = useState<DispoItem | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'erreur' } | null>(null)
  const [cleNouvelle, setCleNouvelle] = useState<string | null>(null)
  const [assistantOuvert, setAssistantOuvert] = useState(false)
  const timerAnimation = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supprimerDispo = useSupprimerDisponibilite()

  useEffect(() => {
    return () => {
      if (timerAnimation.current) clearTimeout(timerAnimation.current)
    }
  }, [])

  function afficherToast(message: string, type: 'success' | 'erreur') {
    setToast({ message, type })
  }

  function supprimer() {
    if (!cibleSuppression) return
    const { jour, heureDebut, heureFin } = cibleSuppression
    setCibleSuppression(null)
    startTransition(async () => {
      try {
        await supprimerDispo.mutateAsync({ heureDebut, heureFin, jour: jour as JourSemaine })
        afficherToast('Disponibilité supprimée', 'success')
      } catch (err) {
        afficherToast(err instanceof Error ? err.message : 'Échec de la suppression.', 'erreur')
      }
    })
  }

  function enregistré(dispo: DispoItem, precedente: DispoItem | null) {
    if (timerAnimation.current) clearTimeout(timerAnimation.current)
    setCleNouvelle(cleDispo(dispo))
    timerAnimation.current = setTimeout(() => setCleNouvelle(null), 2000)
    afficherToast(precedente ? 'Disponibilité modifiée' : 'Disponibilité ajoutée', 'success')
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onFerme={() => setToast(null)} />}
      {cibleSuppression && (
        <Modale onFerme={() => setCibleSuppression(null)} titre="Supprimer cette disponibilité ?">
          <p className="lpv-modale__texte">
            {cibleSuppression.jour} · {cibleSuppression.heureDebut} → {cibleSuppression.heureFin} — cette action est définitive.
          </p>
          <div className="lpv-modale__actions">
            <Bouton onClick={() => setCibleSuppression(null)} type="button" variante="secondaire">
              Annuler
            </Bouton>
            <Bouton disabled={pending} onClick={supprimer} type="button" variante="danger">
              {pending ? 'Suppression…' : 'Supprimer'}
            </Bouton>
          </div>
        </Modale>
      )}

      <p style={{ margin: '0 0 1rem' }}>
        <Bouton onClick={() => setAssistantOuvert(true)} type="button">
          + Ajouter un créneau
        </Bouton>
      </p>

      {dispos.length > 0 && (
        <SummaryList
          cleNouvelle={cleNouvelle !== null ? cleNouvelle.split('|')[0] : undefined}
          items={dispos.map((dispo): { cle: string; valeur: string; actions?: (ActionSummaryList | React.ReactNode)[] } => ({
            cle: dispo.jour,
            valeur: `${dispo.heureDebut} → ${dispo.heureFin}`,
            actions: [
              {
                type: 'normal',
                texte: 'Modifier',
                onClick: () => {
                  setCibleEdition(dispo)
                  setAssistantOuvert(true)
                },
                disabled: pending,
              },
              {
                type: 'danger',
                texte: 'Supprimer',
                key: 'supprimer',
                onClick: () => setCibleSuppression(dispo),
                disabled: pending,
              },
            ],
          }))}
        />
      )}

      <FormulaireDispoSteps
        editionDe={cibleEdition}
        key={cibleEdition ? cleDispo(cibleEdition) : 'nouveau'}
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
  const [jour, setJour] = useState(editionDe?.jour ?? '')
  const [heureDebut, setHeureDebut] = useState(editionDe?.heureDebut ?? '')
  const [heureFin, setHeureFin] = useState(editionDe?.heureFin ?? '')
  const [pending, startTransition] = useTransition()
  const [erreur, setErreur] = useState<string | null>(null)
  const [precedente, setPrecedente] = useState<DispoItem | null>(editionDe ?? null)
  const ajouterDispo = useAjouterDisponibilite()
  const modifierDispo = useModifierDisponibilite()

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

      try {
        if (precedente) {
          await modifierDispo.mutateAsync({ nouveau: nouveau as Disponibilite, origine: precedente as Disponibilite })
          setEtape(1)
          setJour('')
          setHeureDebut('')
          setHeureFin('')
          setPrecedente(null)
          onFerme()
          onEnregistre?.(nouveau, precedente)
          return
        }

        await ajouterDispo.mutateAsync(nouveau as Disponibilite)
        setEtape(1)
        setJour('')
        setHeureDebut('')
        setHeureFin('')
        onFerme()
        onEnregistre?.(nouveau, null)
      } catch (err) {
        setErreur(err instanceof Error ? err.message : 'La disponibilité n’a pas pu être enregistrée.')
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
  return <NotificationBanner titre={message} type="success" />
}

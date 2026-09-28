'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/atoms/a-button'
import { ErrorSummary } from '@/components/molecules'
import { QuestionPage, QuestionPageAnswers } from '@/components/templates'
import { ConfirmAction } from '@/components/organisms/o-confirm-action'
import { useEnregistrerPret, useListCatalogue } from '@/bibliotheque'
import { useListElevesDuProf } from '@/students'

type Etape = 1 | 2 | 3

const DUREE_PRET_JOURS = 21

// Assistant « un prêt en 3 questions » (pattern question pages) :
// élève → exemplaire disponible → récap + validation.
// La validation métier (plafond 3 prêts, exemplaire dispo) reste
// côté serveur (hooks Payload) : les erreurs remontent telles quelles.
export default function NouveauPretView({ profId }: { profId: number }) {
  const router = useRouter()
  const catalogue = useListCatalogue()
  const eleves = useListElevesDuProf(profId)
  const enregistrer = useEnregistrerPret()

  const [step, setStep] = useState<Etape>(1)
  const [eleveId, setEleveId] = useState<number | null>(null)
  const [exemplaireId, setExemplaireId] = useState<number | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [confirmOuvert, setConfirmOuvert] = useState(false)

  const eleveChoisi = (eleves.data ?? []).find((e) => e.id === eleveId) ?? null
  const dispos = (catalogue.data ?? [])
    .flatMap((livre) =>
      livre.exemplaires
        .filter((ex) => ex.disponible)
        .map((ex) => ({ ...ex, livreTitre: livre.titre })),
    )
  const exemplaireChoisi = dispos.find((ex) => ex.id === exemplaireId) ?? null

  async function validerPret(motDePasse?: string) {
    if (!eleveId || !exemplaireId || !motDePasse) return
    setErreur(null)
    setPending(true)
    try {
      await enregistrer.mutateAsync({ eleveId, exemplaireId, motDePasse })
      router.push('/profs/bibliotheque?pret=enregistre')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Le prêt n’a pas pu être enregistré.')
      setPending(false)
    }
  }

  return (
    <div className="lpv-container">
      {step === 1 && (
        <QuestionPage
          actions={
            <>
              <Button disabled={!eleveId} onClick={() => setStep(2)} type="button">
                Continuer
              </Button>
              <Button onClick={() => router.push('/profs/bibliotheque')} type="button" variant="secondary">
                Annuler
              </Button>
            </>
          }
          question="Quel élève emprunte ?"
          retour={{ href: '/profs/bibliotheque', label: 'Retour à la bibliothèque' }}
          step={1}
          stepSize={3}
        >
          {eleves.isLoading ? (
            <p className="lpv-muted">Chargement des élèves…</p>
          ) : (eleves.data ?? []).length === 0 ? (
            <p className="lpv-muted">Aucun élève relié à votre compte.</p>
          ) : (
            <div className="lpv-o-availability-wizard__days">
              {(eleves.data ?? []).map((eleve) => (
                <button
                  className={`lpv-o-availability-wizard__day-option${eleveId === eleve.id ? ' lpv-o-availability-wizard__day-option--active' : ''}`}
                  key={eleve.id}
                  onClick={() => setEleveId(eleve.id)}
                  type="button"
                >
                  {eleve.prenom} {eleve.nom}
                </button>
              ))}
            </div>
          )}
        </QuestionPage>
      )}

      {step === 2 && (
        <QuestionPage
          actions={
            <>
              {erreur && <ErrorSummary errors={[erreur]} />}
              <Button disabled={!exemplaireId} onClick={() => setStep(3)} type="button">
                Continuer
              </Button>
            </>
          }
          question="Quel exemplaire prêter ?"
          reponses={[
            {
              question: 'Élève',
              valeur: eleveChoisi ? `${eleveChoisi.prenom} ${eleveChoisi.nom}` : '—',
              onClick: () => setStep(1),
            },
          ]}
          retour={{
            href: '#',
            onClick: () => {
              setErreur(null)
              setStep(1)
            },
          }}
          step={2}
          stepSize={3}
        >
          {catalogue.isLoading ? (
            <p className="lpv-muted">Chargement du catalogue…</p>
          ) : dispos.length === 0 ? (
            <p className="lpv-muted">Aucun exemplaire disponible pour le moment.</p>
          ) : (
            <div className="lpv-o-availability-wizard__days">
              {dispos.map((ex) => (
                <button
                  className={`lpv-o-availability-wizard__day-option${exemplaireId === ex.id ? ' lpv-o-availability-wizard__day-option--active' : ''}`}
                  key={ex.id}
                  onClick={() => setExemplaireId(ex.id)}
                  type="button"
                >
                  {ex.livreTitre}
                  <span style={{ display: 'block', fontSize: '0.85rem', opacity: 0.8 }}>{ex.code}</span>
                </button>
              ))}
            </div>
          )}
        </QuestionPage>
      )}

      {step === 3 && (
        <QuestionPage
          actions={
            <>
              {erreur && <ErrorSummary errors={[erreur]} />}
              <Button disabled={pending} onClick={() => setConfirmOuvert(true)} type="button">
                Valider le prêt
              </Button>
            </>
          }
          question="Vérifiez et validez"
          reponses={[
            {
              question: 'Élève',
              valeur: eleveChoisi ? `${eleveChoisi.prenom} ${eleveChoisi.nom}` : '—',
              onClick: () => setStep(1),
            },
            {
              question: 'Exemplaire',
              valeur: exemplaireChoisi ? `${exemplaireChoisi.livreTitre} (${exemplaireChoisi.code})` : '—',
              onClick: () => setStep(2),
            },
          ]}
          retour={{
            href: '#',
            onClick: () => {
              setErreur(null)
              setStep(2)
            },
          }}
          step={3}
          stepSize={3}
        >
          <QuestionPageAnswers
            titre="Récapitulatif"
            reponses={[
              {
                question: 'Prêt',
                valeur: exemplaireChoisi
                  ? `${exemplaireChoisi.livreTitre} (${exemplaireChoisi.code}) → ${eleveChoisi ? `${eleveChoisi.prenom} ${eleveChoisi.nom}` : '—'}`
                  : '—',
              },
            ]}
          />
        </QuestionPage>
      )}

      {confirmOuvert && eleveChoisi && exemplaireChoisi ? (
        <ConfirmAction
          confirmLabel="Confirmer le prêt"
          description={`« ${exemplaireChoisi.livreTitre} » sera prêté à ${eleveChoisi.prenom} ${eleveChoisi.nom} pour ${DUREE_PRET_JOURS} jours. Confirmez avec votre mot de passe.`}
          onClose={() => {
            setConfirmOuvert(false)
            setErreur(null)
          }}
          onConfirm={(motDePasse) => {
            void validerPret(motDePasse)
          }}
          pending={pending}
          pendingLabel="Enregistrement…"
          requirePassword
          title="Enregistrer ce prêt ?"
        />
      ) : null}
    </div>
  )
}
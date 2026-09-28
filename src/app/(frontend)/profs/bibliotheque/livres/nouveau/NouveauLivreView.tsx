'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/atoms/a-button'
import { ErrorSummary, Input } from '@/components/molecules'
import { QuestionPage, QuestionPageAnswers } from '@/components/templates'
import { useCreerLivre } from '@/bibliotheque'

const NIVEAUX = [
  { label: 'Primaire', value: 'primaire' },
  { label: 'Collège', value: 'college' },
  { label: 'Lycée', value: 'lycee' },
]

const CATEGORIES = [
  { label: 'Lecture', value: 'lecture' },
  { label: 'Méthodologie', value: 'methodologie' },
  { label: 'Anglais', value: 'anglais' },
  { label: 'Manuel', value: 'manuel' },
  { label: 'Autre', value: 'autre' },
]

// Assistant « référencer un ouvrage en 3 questions » (pattern question pages) :
// titre (+ auteur) → niveau/catégorie → résumé (optionnel) + récap.
export default function NouveauLivreView() {
  const router = useRouter()
  const creer = useCreerLivre()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [titre, setTitre] = useState('')
  const [auteur, setAuteur] = useState('')
  const [niveau, setNiveau] = useState('')
  const [categorie, setCategorie] = useState('')
  const [resume, setResume] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function annuler() {
    router.push('/profs/bibliotheque')
  }

  async function enregistrer() {
    if (!titre.trim()) return
    setErreur(null)
    setPending(true)
    try {
      const id = await creer.mutateAsync({
        auteur: auteur.trim() || undefined,
        categorie: categorie || undefined,
        niveau: niveau || undefined,
        resume: resume.trim() || undefined,
        titre: titre.trim(),
      })
      router.push(`/profs/bibliotheque/livres/${id}?cree=1`)
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Le livre n’a pas pu être créé.')
      setPending(false)
    }
  }

  return (
    <div className="lpv-container">
      {step === 1 && (
        <QuestionPage
          actions={
            <>
              <Button disabled={!titre.trim()} onClick={() => setStep(2)} type="button">
                Continuer
              </Button>
              <Button onClick={annuler} type="button" variant="secondary">
                Annuler
              </Button>
            </>
          }
          question="Quel ouvrage référencer ?"
          retour={{ href: '/profs/bibliotheque', label: 'Retour à la bibliothèque' }}
          step={1}
          stepSize={3}
        >
          <Input
            id="livre-titre"
            label="Titre"
            onChange={(e) => setTitre(e.target.value)}
            value={titre}
          />
          <Input
            id="livre-auteur"
            label="Auteur"
            onChange={(e) => setAuteur(e.target.value)}
            optional
            value={auteur}
          />
        </QuestionPage>
      )}

      {step === 2 && (
        <QuestionPage
          actions={
            <>
              <Button disabled={!niveau && !categorie} onClick={() => setStep(3)} type="button">
                Continuer
              </Button>
            </>
          }
          question="Où le classer ?"
          reponses={[
            { question: 'Titre', valeur: titre || '—', onClick: () => setStep(1) },
            { question: 'Auteur', valeur: auteur || '—', onClick: () => setStep(1) },
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
          <Input
            as="select"
            id="livre-niveau"
            label="Niveau"
            onChange={(e) => setNiveau(e.target.value)}
            optional
            options={[{ label: 'Choisir un niveau…', value: '' }, ...NIVEAUX]}
            value={niveau}
          />
          <Input
            as="select"
            id="livre-categorie"
            label="Catégorie"
            onChange={(e) => setCategorie(e.target.value)}
            optional
            options={[{ label: 'Choisir une catégorie…', value: '' }, ...CATEGORIES]}
            value={categorie}
          />
        </QuestionPage>
      )}

      {step === 3 && (
        <QuestionPage
          actions={
            <>
              {erreur && <ErrorSummary errors={[erreur]} />}
              <Button disabled={pending} onClick={enregistrer} type="button">
                {pending ? 'Création…' : 'Créer le livre'}
              </Button>
            </>
          }
          question="Un résumé à afficher sur la fiche ?"
          reponses={[
            { question: 'Titre', valeur: titre || '—', onClick: () => setStep(1) },
            { question: 'Auteur', valeur: auteur || '—', onClick: () => setStep(1) },
            {
              question: 'Classement',
              valeur: [niveau, categorie].filter(Boolean).join(' / ') || '—',
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
          <Input
            as="textarea"
            hint="Quelques phrases qui présentent l'ouvrage aux élèves et aux familles."
            id="livre-resume"
            label="Résumé"
            onChange={(e) => setResume(e.target.value)}
            optional
            value={resume}
          />
          <QuestionPageAnswers
            titre="Récapitulatif"
            reponses={[
              {
                question: 'Ouvrage',
                valeur: `${titre || '—'}${auteur ? ` · ${auteur}` : ''}${niveau || categorie ? ` · ${[niveau, categorie].filter(Boolean).join(' / ')}` : ''}`,
              },
            ]}
          />
        </QuestionPage>
      )}
    </div>
  )
}
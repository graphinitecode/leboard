'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { BackLink, InsetText } from '@/components/atoms'
import { Button } from '@/components/atoms/a-button'
import { ErrorSummary, Input, Toast } from '@/components/molecules'
import { ConfirmAction } from '@/components/organisms/o-confirm-action'
import { useListCatalogue, useModifierLivre } from '@/bibliotheque'

export interface ModifierLivreProps {
  livreId: number
}

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

// Édition des métadonnées du livre dans le portail (admin/bénévole).
// Les exemplaires restent gérés dans le panneau d'administration.
export default function ModifierLivreView({ livreId }: ModifierLivreProps) {
  const router = useRouter()
  const catalogue = useListCatalogue()
  const modifier = useModifierLivre()

  const livre = (catalogue.data ?? []).find((l) => l.id === livreId)

  const [titre, setTitre] = useState('')
  const [auteur, setAuteur] = useState('')
  const [isbn, setIsbn] = useState('')
  const [niveau, setNiveau] = useState('')
  const [categorie, setCategorie] = useState('')
  const [editeur, setEditeur] = useState('')
  const [resume, setResume] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [succes, setSucces] = useState(false)
  const [confirmOuvert, setConfirmOuvert] = useState(false)

  // Préremplissage après chargement du catalogue (une seule fois).
  const [prerempli, setPrerempli] = useState(false)
  if (livre && !prerempli) {
    setTitre(livre.titre)
    setAuteur(livre.auteur ?? '')
    setIsbn(livre.isbn ?? '')
    setNiveau(livre.niveau ?? '')
    setCategorie(livre.categorie ?? '')
    setEditeur(livre.editeur ?? '')
    setResume(livre.resume ?? '')
    setPrerempli(true)
  }

  if (catalogue.isLoading) {
    return <p className="lpv-muted">Chargement du livre…</p>
  }

  if (!livre) {
    return (
      <>
        <BackLink href="/profs/bibliotheque">Retour au catalogue</BackLink>
        <InsetText>Livre introuvable ou retiré du catalogue.</InsetText>
      </>
    )
  }

  async function enregistrer(e?: React.FormEvent) {
    e?.preventDefault()
    if (!titre.trim()) {
      setErreur('Le titre est obligatoire.')
      return
    }
    setErreur(null)
    setPending(true)
    try {
      await modifier.mutateAsync({
        auteur: auteur.trim() || undefined,
        categorie: categorie || undefined,
        editeur: editeur.trim() || undefined,
        id: livreId,
        isbn: isbn.trim() || undefined,
        niveau: niveau || undefined,
        resume: resume.trim() || undefined,
        titre: titre.trim(),
      })
      setConfirmOuvert(false)
      setSucces(true)
      router.refresh()
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Le livre n’a pas pu être modifié.')
      setConfirmOuvert(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <BackLink href={`/profs/bibliotheque/livres/${livre.id}`}>
        Retour à la fiche du livre
      </BackLink>
      <h1 className="lpv-h1">Modifier la fiche</h1>
      <p className="lpv-muted">
        Les exemplaires physiques se gèrent dans le panneau d&apos;administration.
      </p>

      {succes && (
        <Toast message="Fiche modifiée" type="success" onClose={() => setSucces(false)} />
      )}
      <form className="lpv-login" noValidate onSubmit={(e) => { e.preventDefault(); setConfirmOuvert(true) }}>
        <ErrorSummary errors={erreur ? [{ fieldId: 'livre-titre', text: erreur }] : []} />
        <Input
          error={erreur && !titre.trim() ? erreur : undefined}
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
        <Input
          hint="ISBN-10 ou ISBN-13 (10 ou 13 chiffres)."
          id="livre-isbn"
          label="ISBN"
          onChange={(e) => setIsbn(e.target.value)}
          optional
          value={isbn}
        />
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
        <Input
          id="livre-editeur"
          label="Éditeur"
          onChange={(e) => setEditeur(e.target.value)}
          optional
          value={editeur}
        />
        <Input
          as="textarea"
          hint="Quelques phrases qui présentent l'ouvrage aux élèves et aux familles."
          id="livre-resume"
          label="Résumé"
          onChange={(e) => setResume(e.target.value)}
          optional
          value={resume}
        />
        <Button disabled={pending} type="submit" className="w-full md:w-auto">
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>

      {confirmOuvert ? (
        <ConfirmAction
          confirmLabel="Enregistrer"
          description={`Les modifications de « ${titre || 'la fiche'} » seront enregistrées.`}
          onClose={() => {
            setConfirmOuvert(false)
            setErreur(null)
          }}
          onConfirm={() => {
            void enregistrer()
          }}
          pending={pending}
          pendingLabel="Enregistrement…"
          title="Enregistrer les modifications ?"
        />
      ) : null}
    </>
  )
}
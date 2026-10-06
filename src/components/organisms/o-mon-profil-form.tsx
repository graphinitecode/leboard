'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Label } from '@/components/atoms/a-label'
import { ErrorSummary, Input, Toast } from '@/components/molecules'
import { Checkbox } from '@/components/molecules/m-checkbox'

import { updateMonProfil } from '@/app/(frontend)/actions/mon-profil'

export interface MonProfilProps {
  portail: 'profs' | 'parents'
  initial: { prenom: string; nom: string; telephone: string; email: string; alertesEmail?: boolean }
}

// Formulaire d'édition du profil de l'utilisateur connecté (profs et parents).
// Server action updateMonProfil : l'identité vient de la session, jamais du client.
export function MonProfilForm({ portail, initial }: MonProfilProps) {
  const router = useRouter()
  const [prenom, setPrenom] = useState(initial.prenom)
  const [nom, setNom] = useState(initial.nom)
  const [telephone, setTelephone] = useState(initial.telephone)
  const [alertesEmail, setAlertesEmail] = useState(initial.alertesEmail ?? true)
  const [erreurs, setErreurs] = useState<{ champ: string; message: string }[]>([])
  const [pending, setPending] = useState(false)
  const [succes, setSucces] = useState(false)

  const erreurChamp = (champ: string) =>
    erreurs.find((e) => e.champ === champ)?.message

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreurs([])
    setSucces(false)
    setPending(true)

    const resultat = await updateMonProfil({
      prenom,
      nom,
      telephone,
      ...(portail === 'parents' ? { alertesEmail } : {}),
    })

    setPending(false)

    if (!resultat.ok) {
      setErreurs(resultat.erreurs)
      return
    }

    setSucces(true)
    router.refresh()
  }

  return (
    <form className="lpv-login__form" onSubmit={submit}>
      <ErrorSummary
        errors={erreurs.map((e) => ({ fieldId: `champ-${e.champ}`, text: e.message }))}
      />
      {succes && (
        <Toast
          message="Profil mis à jour"
          type="success"
          onClose={() => setSucces(false)}
        />
      )}
      <Input
        autoComplete="given-name"
        error={erreurChamp('prenom')}
        id="prenom"
        label="Prénom"
        onChange={(e) => setPrenom(e.target.value)}
        value={prenom}
      />
      <Input
        autoComplete="family-name"
        error={erreurChamp('nom')}
        id="nom"
        label="Nom"
        onChange={(e) => setNom(e.target.value)}
        value={nom}
      />
      <Input
        autoComplete="tel"
        error={erreurChamp('telephone')}
        hint="Visible par l'association, jamais par les autres familles."
        id="telephone"
        label="Téléphone"
        onChange={(e) => setTelephone(e.target.value)}
        optional
        value={telephone}
      />
      <div className="lpv-form-group">
        <Label htmlFor="email-lu">Adresse e-mail</Label>
        <p className="lpv-muted" id="email-lu">
          {initial.email}
        </p>
        <p className="lpv-muted">
          Pour modifier votre e-mail ou votre mot de passe,{' '}
          {portail === 'profs' ? (
            <Link className="lpv-link-inline" href="/admin">
              utilisez le panneau d&apos;administration
            </Link>
          ) : (
            'contactez l’association'
          )}
          .
        </p>
      </div>
      {portail === 'parents' && (
        <Checkbox
          hint="Retard ou rappel de retour d’un livre, absences répétées aux séances."
          idPrefix="alertes-email"
          legendSize="s"
          name="Alertes"
          onChange={(e) => setAlertesEmail(e.target.checked)}
          options={[{ checked: alertesEmail, label: 'Recevoir les alertes par e-mail', value: 'alertes-email' }]}
        />
      )}
      <Button disabled={pending} type="submit" className="w-full md:w-auto">
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </form>
  )
}
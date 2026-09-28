'use client'

import Link from 'next/link'

import { BackLink, InsetText, Panel, Tag } from '@/components/atoms'
import { estPretEnCours, joursDeRetard, useListCatalogue, useListTousPretsEnCours } from '@/bibliotheque'

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  const date = new Date(iso)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const NIVEAU_LABELS: Record<string, string> = {
  primaire: 'Primaire',
  college: 'Collège',
  lycee: 'Lycée',
}

const CATEGORIE_LABELS: Record<string, string> = {
  lecture: 'Lecture',
  methodologie: 'Méthodologie',
  anglais: 'Anglais',
  manuel: 'Manuel',
  autre: 'Autre',
}

// Fiche catalogue d'un livre : infos, exemplaires (statut) et prêts en cours.
// Lecture seule pour les profs ; la gestion fine (exemplaires, archivage)
// se fait dans le panneau d'administration.
export default function FicheLivreView({ livreId }: { livreId: number }) {
  const catalogue = useListCatalogue()
  const prets = useListTousPretsEnCours()

  const livre = (catalogue.data ?? []).find((l) => l.id === livreId)

  if (catalogue.isLoading) {
    return <p className="lpv-muted">Chargement du livre…</p>
  }

  if (!livre) {
    return (
      <>
        <BackLink href="/profs/bibliotheque">Retour à la bibliothèque</BackLink>
        <InsetText>Livre introuvable ou retiré du catalogue.</InsetText>
      </>
    )
  }

  const pretsDuLivre = (prets.data ?? []).filter((pret) =>
    livre.exemplaires.some((ex) => ex.code === pret.exemplaireCode),
  )

  return (
    <>
      <BackLink href="/profs/bibliotheque">Retour à la bibliothèque</BackLink>

      <h1 className="lpv-h1">{livre.titre}</h1>
      <p className="lpv-muted">
        {livre.auteur ? `${livre.auteur} · ` : ''}
        {livre.niveau ? `${NIVEAU_LABELS[livre.niveau] ?? livre.niveau} · ` : ''}
        {livre.categorie ? CATEGORIE_LABELS[livre.categorie] ?? livre.categorie : ''}
      </p>

      <Panel>
        <h2 style={{ marginTop: 0 }}>Exemplaires</h2>
        {livre.exemplaires.length === 0 ? (
          <p className="lpv-muted">Aucun exemplaire enregistré pour ce livre.</p>
        ) : (
          <ul className="lpv-unstyled-list">
            {livre.exemplaires.map((ex) => (
              <li key={ex.id}>
                <strong>{ex.code}</strong>{' '}
                <Tag color={ex.disponible ? 'green' : 'red'}>
                  {ex.disponible ? 'Disponible' : 'Emprunté'}
                </Tag>
                <span className="lpv-muted"> · {ex.etat}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <h2 style={{ marginTop: 0 }}>Prêts en cours</h2>
        {prets.isLoading ? (
          <p className="lpv-muted">Chargement…</p>
        ) : pretsDuLivre.length === 0 ? (
          <InsetText>Aucun prêt en cours pour ce livre.</InsetText>
        ) : (
          pretsDuLivre.map((pret) => (
            <p key={pret.id} className="lpv-muted">
              {pret.eleveLabel} — retour prévu le {formatDate(pret.dateRetourPrevue)}
              {estPretEnCours(pret) && joursDeRetard(pret.dateRetourPrevue) > 0 ? (
                <Tag color="red">En retard</Tag>
              ) : null}
            </p>
          ))
        )}
      </Panel>

      <Link className="lpv-link-inline" href="/admin">
        Gérer ce livre dans le panneau d&apos;administration
      </Link>
    </>
  )
}
'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'

import { InsetText, Panel, Tag } from '@/components/atoms'
import { Button } from '@/components/atoms/a-button'
import { Toast } from '@/components/molecules'
import {
  estPretEnCours,
  joursDeRetard,
  useListCatalogue,
  useListTousPretsEnCours,
  useMarquerRetourne,
} from '@/bibliotheque'

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

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  const date = new Date(iso)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function BibliothequeView() {
  return (
    <Suspense fallback={<p className="lpv-muted">Chargement…</p>}>
      <VueBibliotheque />
    </Suspense>
  )
}

function VueBibliotheque() {
  const router = useRouter()
  const params = useSearchParams()
  const prets = useListTousPretsEnCours()
  const catalogue = useListCatalogue()
  const marquerRetourne = useMarquerRetourne()
  const [recherche, setRecherche] = useState('')
  const [niveauFiltre, setNiveauFiltre] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [pretRetourne, setPretRetourne] = useState(false)

  // Retour de l'assistant prêt (?pret=enregistre) : toast dérivé de l'URL.
  const pretEnregistre = params.get('pret') === 'enregistre'

  const enCours = (prets.data ?? []).filter(estPretEnCours)
  const retards = enCours.filter((pret) => joursDeRetard(pret.dateRetourPrevue) > 0)
  const rappels = enCours.filter((pret) => {
    const jours = joursDeRetard(pret.dateRetourPrevue)
    return jours === 0 || jours === -2 || jours === -1
  })

  const catalogueFiltre = useMemo(() => {
    let liste = catalogue.data ?? []
    if (niveauFiltre) {
      liste = liste.filter((livre) => livre.niveau === niveauFiltre)
    }
    const q = recherche.trim().toLowerCase()
    if (!q) return liste
    return liste.filter(
      (livre) =>
        livre.titre.toLowerCase().includes(q) ||
        (livre.auteur ?? '').toLowerCase().includes(q),
    )
  }, [catalogue.data, recherche, niveauFiltre])

  async function retourner(pretId: number) {
    setErreur(null)
    try {
      await marquerRetourne.mutateAsync(pretId)
      setPretRetourne(true)
    } catch {
      setErreur('Impossible de marquer le prêt comme retourné. Réessayez.')
    }
  }

  return (
    <>
      {(erreur || prets.isError || catalogue.isError) && (
        <InsetText>
          {erreur ?? 'Impossible de charger la bibliothèque. Rechargez la page ou réessayez plus tard.'}
        </InsetText>
      )}
      {pretRetourne && (
        <Toast message="Prêt marqué comme retourné" type="success" onClose={() => setPretRetourne(false)} />
      )}
      {pretEnregistre && (
        <Toast
          message="Prêt enregistré"
          type="success"
          onClose={() => router.replace('/profs/bibliotheque')}
        />
      )}

      <h1 className="lpv-h1">Bibliothèque</h1>
      <p className="lpv-muted">{catalogue.data?.length ?? '…'} ouvrages référencés au catalogue.</p>

      <div className="lpv-cards-grid lpv-cards-grid--3">
        <div className="lpv-card lpv-stat">
          <span className="lpv-stat__value">{catalogue.data?.length ?? '—'}</span>
          <div className="lpv-stat__label">Livres au catalogue</div>
        </div>
        <div className="lpv-card lpv-stat success">
          <span className="lpv-stat__value">{prets.isLoading ? '—' : enCours.length}</span>
          <div className="lpv-stat__label">Prêts en cours</div>
        </div>
        <div className="lpv-card lpv-stat alert">
          <span className="lpv-stat__value">{prets.isLoading ? '—' : retards.length}</span>
          <div className="lpv-stat__label">Retards</div>
        </div>
      </div>

      <div className="lpv-t-dashboard-page__columns">
        <div className="lpv-t-dashboard-page__main">
          <section className="lpv-t-dashboard-page__section" aria-labelledby="retards-titre">
            <h2 className="lpv-h2" id="retards">
              Retards
            </h2>
            {prets.isLoading ? (
              <p className="lpv-muted">Chargement des prêts…</p>
            ) : retards.length === 0 ? (
              <InsetText>Aucun retard. Tous les prêts sont dans les temps.</InsetText>
            ) : (
              retards.map((pret) => (
                <Panel key={pret.id}>
                  <div className="lpv-m-list-row">
                    <span>
                      <span className="lpv-m-list-row__title">
                        &laquo; {pret.livreLabel ?? pret.exemplaireCode ?? 'Livre'} &raquo; —{' '}
                        {pret.eleveLabel ?? 'Élève'}
                      </span>
                      <span style={{ color: 'var(--lpv-text-muted)' }}>
                        {' '}
                        · Retour prévu le {formatDate(pret.dateRetourPrevue)} —{' '}
                        {joursDeRetard(pret.dateRetourPrevue)} jour(s) de retard
                      </span>
                    </span>
                    <Button
                      disabled={marquerRetourne.isPending}
                      onClick={() => retourner(pret.id)}
                      type="button"
                      variant="secondary"
                    >
                      Marquer comme retourné
                    </Button>
                  </div>
                </Panel>
              ))
            )}
          </section>

          <section className="lpv-t-dashboard-page__section" aria-labelledby="catalogue">
            <h2 className="lpv-h2" id="catalogue">
              Catalogue
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
              <label className="lpv-visually-hidden" htmlFor="recherche-catalogue">
                Rechercher un titre ou un auteur
              </label>
              <input
                className="lpv-a-input"
                id="recherche-catalogue"
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher un titre, un auteur…"
                style={{ flex: '1 1 200px' }}
                type="search"
                value={recherche}
              />
              <label className="lpv-visually-hidden" htmlFor="filtre-niveau">
                Filtrer par niveau
              </label>
              <select
                className="lpv-a-select"
                id="filtre-niveau"
                onChange={(e) => setNiveauFiltre(e.target.value)}
                value={niveauFiltre}
              >
                <option value="">Tous les niveaux</option>
                <option value="primaire">Primaire</option>
                <option value="college">Collège</option>
                <option value="lycee">Lycée</option>
              </select>
              <Link className="lpv-a-button" href="/profs/bibliotheque/prets/nouveau">
                Enregistrer un prêt
              </Link>
            </div>
            {catalogue.isLoading ? (
              <p className="lpv-muted">Chargement du catalogue…</p>
            ) : catalogueFiltre.length === 0 ? (
              <InsetText>Aucun livre ne correspond à votre recherche.</InsetText>
            ) : (
              <table className="lpv-a-table">
                <thead>
                  <tr>
                    <th scope="col">Titre</th>
                    <th scope="col">Auteur</th>
                    <th scope="col">Niveau</th>
                    <th scope="col">Statut</th>
                    <th scope="col">
                      <span className="lpv-visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {catalogueFiltre.map((livre) => {
                    const dispo = livre.exemplaires.some((ex) => ex.disponible)
                    return (
                      <tr key={livre.id}>
                        <td>{livre.titre}</td>
                        <td>{livre.auteur ?? '—'}</td>
                        <td>{livre.niveau ? NIVEAU_LABELS[livre.niveau] ?? livre.niveau : '—'}</td>
                        <td>
                          <Tag color={dispo ? 'green' : 'red'}>
                            {dispo ? 'Disponible' : 'Emprunté'}
                          </Tag>
                        </td>
                        <td>
                          <Link className="lpv-link" href={`/profs/bibliotheque/livres/${livre.id}`}>
                            Voir
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>

        <aside className="lpv-t-dashboard-page__aside">
          <Panel>
            <h3 style={{ marginTop: 0 }}>Rappels à venir</h3>
            {rappels.length === 0 ? (
              <p className="lpv-muted">Aucun rappel pour les prochains jours.</p>
            ) : (
              rappels.map((pret) => (
                <p key={pret.id} className="lpv-muted">
                  <strong>{pret.eleveLabel}</strong>
                  <br />
                  &laquo; {pret.livreLabel ?? pret.exemplaireCode} &raquo; — retour prévu le{' '}
                  {formatDate(pret.dateRetourPrevue)}
                </p>
              ))
            )}
          </Panel>
          <Panel>
            <h3 style={{ marginTop: 0 }}>Enregistrer un prêt</h3>
            <p className="lpv-muted">Prêter un exemplaire à un élève.</p>
            <Link className="lpv-a-button" href="/profs/bibliotheque/prets/nouveau">
              Nouveau prêt
            </Link>
          </Panel>
          <Panel>
            <h3 style={{ marginTop: 0 }}>Ajouter un livre</h3>
            <p className="lpv-muted">Nouvel ouvrage à référencer au catalogue.</p>
            <Link className="lpv-a-button" href="/profs/bibliotheque/livres/nouveau">
              + Nouveau livre
            </Link>
          </Panel>
        </aside>
      </div>
    </>
  )
}

export { CATEGORIE_LABELS, formatDate }
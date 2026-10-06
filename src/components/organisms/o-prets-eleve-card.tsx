'use client'

import Link from 'next/link'

import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { AlertCard, EmptyState, ListRow } from '@/components/molecules'
import { ConfirmAction } from '@/components/organisms/o-confirm-action'
import {
  joursDeRetard,
  useListPretsEnCours,
  useMarquerRetourne,
} from '@/bibliotheque'

export interface PretsEleveCardProps {
  eleveId: number
  eleveNom: string
  /** Rendre = action patrimoniale, réservée aux gestionnaires bibliothèque. */
  peutGerer?: boolean
}

const actionsStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.75rem',
} as const

// Card de sidebar d'une fiche élève : les livres actuellement en prêt, avec
// l'accès à la fiche du livre et l'action « Rendre » (confirmation par mot de
// passe — action patrimoniale, gestionnaires bibliothèque uniquement). Un
// retard s'annonce par une carte d'alerte accent rouge.
export function PretsEleveCard({
  eleveId,
  eleveNom,
  peutGerer = false,
}: PretsEleveCardProps) {
  const prets = useListPretsEnCours({ eleveId })
  const marquerRetourne = useMarquerRetourne()
  const [pretARendre, setPretARendre] = useState<number | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  async function rendre(pretId: number, motDePasse?: string) {
    if (!motDePasse) return
    setErreur(null)
    try {
      await marquerRetourne.mutateAsync({ motDePasse, pretId })
      setPretARendre(null)
    } catch (err) {
      setErreur(
        err instanceof Error
          ? err.message
          : 'Impossible de marquer le prêt comme retourné.',
      )
      setPretARendre(null)
    }
  }

  const docs = prets.data ?? []
  // Urgent d'abord : retard le plus grand, puis retour le plus proche, puis
  // sans date.
  const trie = [...docs].sort(triParRetourUrgence)

  function retourPrevue(pret: { dateRetourPrevue: string | null }): string {
    return pret.dateRetourPrevue
      ? `Retour prévu le ${new Date(pret.dateRetourPrevue).toLocaleDateString('fr-FR')}`
      : 'Sans date de retour attendue'
  }

  return (
    <section className="lpv-t-dashboard-page__aside-card">
      <h3 className="lpv-t-dashboard-page__aside-card__title">Livres en prêt</h3>

      {erreur ? (
        <p role="alert" style={{ color: 'var(--lpv-red)', margin: '0 0 0.75rem' }}>
          {erreur}
        </p>
      ) : null}

      {prets.isLoading ? (
        <p className="lpv-muted" style={{ margin: 0 }}>Chargement des prêts…</p>
      ) : trie.length === 0 ? (
        <EmptyState
          compact
          icon="rivet-icons:book"
          title="Aucun livre en prêt"
          variant="neutral"
        />
      ) : (
        <div className="lpv-t-dashboard-page__aside-card__stack">
          {trie.map((pret) => {
            const retard = joursDeRetard(pret.dateRetourPrevue)
            const enRetard = retard > 0
            const consultation = pret.livreId ? (
              <Link
                aria-label={`Consulter le livre ${pret.livreLabel ?? ''}`}
                className="lpv-link-inline"
                href={`/profs/bibliotheque/livres/${pret.livreId}`}
              >
                Consulter
              </Link>
            ) : null
            const boutonRendre = peutGerer ? (
              <Button
                ariaLabel={`Marquer le prêt de ${pret.livreLabel ?? 'ce livre'} comme retourné`}
                onClick={() => setPretARendre(pret.id)}
                type="button"
                variant="success"
              >
                Rendre
              </Button>
            ) : null

            return enRetard ? (
              <AlertCard
                accent="red"
                href={pret.livreId ? `/profs/bibliotheque/livres/${pret.livreId}` : undefined}
                hrefLabel="Voir la fiche du livre"
                icon={false}
                key={pret.id}
                titre={pret.livreLabel ?? 'Livre emprunté'}
              >
                {retourPrevue(pret)} — en retard de {retard} jour{retard > 1 ? 's' : ''}
                <div style={{ ...actionsStyle, marginTop: '0.6rem' }}>
                  {consultation}
                  {boutonRendre}
                </div>
              </AlertCard>
            ) : (
              <ListRow
                action={
                  <span style={actionsStyle}>
                    {consultation}
                    {boutonRendre}
                  </span>
                }
                key={pret.id}
                subtitle={retourPrevue(pret)}
                title={pret.livreLabel ?? 'Livre emprunté'}
              />
            )
          })}
        </div>
      )}

      {pretARendre !== null ? (
        <ConfirmAction
          confirmLabel="Confirmer le retour"
          description={`Le prêt de ${eleveNom} sera clôturé et l'exemplaire redeviendra disponible. Confirmez avec votre mot de passe.`}
          onClose={() => setPretARendre(null)}
          onConfirm={(motDePasse) => {
            void rendre(pretARendre, motDePasse)
          }}
          pending={marquerRetourne.isPending}
          pendingLabel="Confirmation…"
          requirePassword
          title="Marquer le prêt comme retourné ?"
        />
      ) : null}
    </section>
  )
}

// Urgent d'abord : retard le plus grand, puis retour le plus proche, puis
// sans date.
function triParRetourUrgence(
  a: { dateRetourPrevue: string | null },
  b: { dateRetourPrevue: string | null },
): number {
  const retardA = joursDeRetard(a.dateRetourPrevue)
  const retardB = joursDeRetard(b.dateRetourPrevue)
  if (retardA !== retardB) return retardB - retardA
  if (!a.dateRetourPrevue) return b.dateRetourPrevue ? 1 : 0
  if (!b.dateRetourPrevue) return -1
  return a.dateRetourPrevue.localeCompare(b.dateRetourPrevue)
}
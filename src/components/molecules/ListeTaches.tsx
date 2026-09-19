import { Tag } from '@/components/atoms'

export interface TacheStatut {
  texte: string
  couleur?: 'vert' | 'jaune' | 'orange' | 'rouge' | 'bleu'
}

export interface Tache {
  titre: string
  href?: string
  hint?: string
  statut: TacheStatut | string
}

// Molécule : liste de tâches avec statut. Inspiré de GOV.UK Task list.
// Chaque tâche affiche un titre (lien si href), un hint optionnel, et un statut
// (texte ou Tag). Le statut est lié au titre via aria-describedby pour l'accessibilité.
export function ListeTaches({
  taches,
  idPrefix = 'tache',
}: {
  taches: Tache[]
  idPrefix?: string
}) {
  return (
    <ul className="lpv-liste-taches">
      {taches.map((tache, index) => {
        const statutId = `${idPrefix}-${index + 1}-statut`
        const hintId = tache.hint ? `${idPrefix}-${index + 1}-hint` : undefined
        const describedBy = [hintId, statutId].filter(Boolean).join(' ')

        return (
          <li
            className={`lpv-liste-taches__item${tache.href ? ' lpv-liste-taches__item--avec-lien' : ''}`}
            key={`${tache.titre}-${index}`}
          >
            <div className="lpv-liste-taches__nom-et-hint">
              {tache.href ? (
                <a
                  aria-describedby={describedBy || undefined}
                  className="lpv-link lpv-liste-taches__lien"
                  href={tache.href}
                >
                  {tache.titre}
                </a>
              ) : (
                <span aria-describedby={describedBy || undefined}>{tache.titre}</span>
              )}
              {tache.hint ? (
                <div className="lpv-liste-taches__hint" id={hintId}>
                  {tache.hint}
                </div>
              ) : null}
            </div>
            <div className="lpv-liste-taches__statut" id={statutId}>
              {typeof tache.statut === 'string' ? (
                tache.statut
              ) : (
                <Tag couleur={tache.statut.couleur}>{tache.statut.texte}</Tag>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
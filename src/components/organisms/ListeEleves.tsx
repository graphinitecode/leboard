// Organisme : liste « Mes élèves » du dashboard (grille de cards cliquables)
import Link from 'next/link'

import { InsetText } from '@/components/atoms'

export interface EleveResumee {
  id: number | string
  prenom: string
  nom: string
  niveau: string
  groupe?: string | null
}

function initiales(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
}

export function ListeEleves({
  eleves,
  titre = 'Mes élèves',
}: {
  eleves: EleveResumee[]
  titre?: string
}) {
  return (
    <section>
      <h2 className="lpv-h2">
        {titre} ({eleves.length})
      </h2>
      {eleves.length === 0 ? (
        <InsetText>Aucun élève référent.</InsetText>
      ) : (
        <div className="lpv-eleves-grid">
          {eleves.map((eleve) => (
            <Link
              className="lpv-eleve-card"
              href={`/profs/eleves/${eleve.id}`}
              key={String(eleve.id)}
            >
              <span className="lpv-eleve-card__haut">
                <span aria-hidden="true" className="lpv-avatar">
                  {initiales(eleve.prenom, eleve.nom)}
                </span>
                <span>
                  <span className="lpv-eleve-card__nom">
                    {eleve.prenom} {eleve.nom}
                  </span>
                  <br />
                  <span className="lpv-eleve-card__detail">{eleve.groupe ?? eleve.niveau}</span>
                </span>
              </span>
              <span className="lpv-eleve-card__lien">Voir la fiche →</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
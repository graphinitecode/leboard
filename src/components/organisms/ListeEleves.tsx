// Organisme : liste « Mes élèves » du dashboard (summary list cliquable)
import Link from 'next/link'

import { InsetText } from '@/components/atoms'
import { SummaryList } from '@/components/molecules/Listes'

export interface EleveResumee {
  id: number | string
  prenom: string
  nom: string
  niveau: string
  groupe?: string | null
}

export function ListeEleves({ eleves, titre = 'Mes élèves' }: { eleves: EleveResumee[]; titre?: string }) {
  return (
    <section>
      <h2 className="lpv-h2">
        {titre} ({eleves.length})
      </h2>
      {eleves.length === 0 ? (
        <InsetText>Aucun élève référent.</InsetText>
      ) : (
        <SummaryList
          items={eleves.map((eleve) => ({
            action: <Link href={`/profs/eleves/${eleve.id}`}>Voir la fiche</Link>,
            cle: eleve.groupe ? `${eleve.groupe}` : eleve.niveau,
            valeur: (
              <strong>
                {eleve.prenom} {eleve.nom}
              </strong>
            ),
          }))}
        />
      )}
    </section>
  )
}
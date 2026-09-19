import { InsetText, Tag } from '@/components/atoms'

export interface SeanceResumee {
  id: number | string
  date: Date
  matiere: string
  retourPresent: boolean
}

function heure(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function jour(date: Date): string {
  return date.toLocaleDateString('fr-FR')
}

// Organisme : bloc « Aujourd'hui » du dashboard prof (card avec chips d'heure)
export function ResumeJournee({ seances }: { seances: SeanceResumee[] }) {
  if (seances.length === 0) {
    return <InsetText>Aucune séance aujourd&rsquo;hui.</InsetText>
  }

  return (
    <section>
      <h2 className="lpv-card__titre" style={{ marginBottom: 0 }}>
        Aujourd&rsquo;hui
      </h2>
      <div className="lpv-card__lignes">
        {seances.map((seance) => (
          <a className="lpv-ligne" href={`/profs/seances/${seance.id}`} key={String(seance.id)}>
            <span>
              <span className="lpv-chip">{heure(seance.date)}</span>{' '}
              <span className="lpv-ligne__titre">{seance.matiere}</span>
            </span>
            {!seance.retourPresent && <Tag couleur="orange">Retour à faire</Tag>}
          </a>
        ))}
      </div>
    </section>
  )
}

// Organisme : liste de séances (cette semaine / passées) avec tags
export function ListeSeances({ seances, titre }: { seances: SeanceResumee[]; titre: string }) {
  return (
    <section>
      <h2 className="lpv-h2">{titre}</h2>
      {seances.length === 0 ? (
        <InsetText>Aucune séance à afficher.</InsetText>
      ) : (
        <div className="lpv-card lpv-card__lignes" style={{ padding: '0.5rem 0.75rem' }}>
          {seances.map((seance) => (
            <a className="lpv-ligne" href={`/profs/seances/${seance.id}`} key={String(seance.id)}>
              <span>
                <span className="lpv-chip">{jour(seance.date)}</span>{' '}
                <span className="lpv-ligne__titre">{heure(seance.date)}</span>
                <span style={{ color: 'var(--lpv-text-muted)' }}> · {seance.matiere}</span>
              </span>
              {!seance.retourPresent && <Tag couleur="orange">Retour à faire</Tag>}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
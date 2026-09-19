// Molécule : résumé des erreurs en tête de formulaire (role alert)
export function ResumeErreurs({
  erreurs,
  titre = 'Il y a un problème',
}: {
  erreurs: string[]
  titre?: string
}) {
  if (erreurs.length === 0) return null

  return (
    <div aria-labelledby="resume-erreurs-titre" className="lpv-error-summary" role="alert" tabIndex={-1}>
      <h2 id="resume-erreurs-titre">{titre}</h2>
      <ul>
        {erreurs.map((erreur) => (
          <li key={erreur}>{erreur}</li>
        ))}
      </ul>
    </div>
  )
}

// Molécule : bandeau de notification (succès / info)
export function NotificationBanner({ titre, type = 'succes' }: { titre: string; type?: 'succes' | 'info' }) {
  return (
    <div
      className={`lpv-banner${type === 'succes' ? ' lpv-banner--succes' : ''}`}
      role={type === 'succes' ? 'status' : 'region'}
    >
      <strong>{titre}</strong>
    </div>
  )
}
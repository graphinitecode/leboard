// Atome : barre de progression (jauge). Rôle progressbar ARIA — la valeur
// courante et le maximum portent le sens ; le remplissage suit la couleur du
// portail. Utilisé par l'import CSV de livres (avancement du versement).
export function Progress({ label, max, value }: { label: string; max: number; value: number }) {
  const pourcentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
      aria-valuetext={`${value} sur ${max}`}
      className="lpv-a-progress"
      role="progressbar"
    >
      <div className="lpv-a-progress__bar" style={{ width: `${pourcentage}%` }} />
    </div>
  )
}
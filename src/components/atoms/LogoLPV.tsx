// Atome : logo LPV Board (coeur bleu) avec nom du service
export function LogoLPV({ libelle = 'LPV Board' }: { libelle?: string }) {
  return (
    <span style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="lpv-entete__logo-img" src="/lpv-logo.svg" />
      <span>{libelle}</span>
    </span>
  )
}
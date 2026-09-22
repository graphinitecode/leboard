// Atome : logo LPV Board (coeur bleu) avec nom du service — utilisé en pied de page
export function LogoLPV({ label = 'LPV Board' }: { label?: string }) {
  return (
    <span style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" style={{ height: '2.25rem', width: 'auto' }} src="/lpv-logo.svg" />
      <span style={{ fontWeight: 700 }}>{label}</span>
    </span>
  )
}
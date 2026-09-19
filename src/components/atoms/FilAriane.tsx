import Link from 'next/link'

// Atome : fil d'Ariane (breadcrumbs). Inspiré de GOV.UK Breadcrumbs.
// Dernier item sans href = page courante (aria-current="page").
// Sur mobile, l'option replierSurMobile ne montre que le premier et le dernier item.
export function FilAriane({
  liens,
  replierSurMobile = false,
  ariaLabel = 'Fil d\'Ariane',
}: {
  liens: { href?: string; libelle: string }[]
  replierSurMobile?: boolean
  ariaLabel?: string
}) {
  if (liens.length === 0) return null

  const classe = `lpv-fil-ariane${replierSurMobile ? ' lpv-fil-ariane--replier' : ''}`

  return (
    <nav aria-label={ariaLabel} className={classe}>
      <ol className="lpv-fil-ariane__liste">
        {liens.map((lien, index) => {
          const estDernier = index === liens.length - 1
          return (
            <li className="lpv-fil-ariane__item" key={lien.libelle}>
              {lien.href && !estDernier ? (
                <Link className="lpv-fil-ariane__lien" href={lien.href}>
                  {lien.libelle}
                </Link>
              ) : (
                <span aria-current={estDernier ? 'page' : undefined} className="lpv-fil-ariane__actuel">
                  {lien.libelle}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
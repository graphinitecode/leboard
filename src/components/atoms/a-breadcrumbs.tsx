import Link from 'next/link'

// Atome : fil d'Ariane (breadcrumbs). Inspiré de GOV.UK Breadcrumbs.
// Dernier item sans href = page courante (aria-current="page").
// Sur mobile, l'option collapseOnMobile ne montre que le premier et le dernier item.
export function Breadcrumbs({
  items,
  collapseOnMobile = false,
  ariaLabel = 'Fil d\'Ariane',
}: {
  items: { href?: string; label: string }[]
  collapseOnMobile?: boolean
  ariaLabel?: string
}) {
  if (items.length === 0) return null

  const classe = `lpv-a-breadcrumbs${collapseOnMobile ? ' lpv-a-breadcrumbs--collapse' : ''}`

  return (
    <nav aria-label={ariaLabel} className={classe}>
      <ol className="lpv-a-breadcrumbs__liste">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li className="lpv-a-breadcrumbs__item" key={item.label}>
              {item.href && !isLast ? (
                <Link className="lpv-a-breadcrumbs__lien" href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="lpv-a-breadcrumbs__actuel">
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

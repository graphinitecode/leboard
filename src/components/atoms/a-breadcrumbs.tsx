import Link from 'next/link'

// Atome : fil d'Ariane (breadcrumbs). Inspiré de GOV.UK Breadcrumbs.
// Item sans href = page courante (aria-current="page").
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
      <ol className="lpv-a-breadcrumbs__list">
        {items.map((item) => (
          <li className="lpv-a-breadcrumbs__item" key={item.label}>
            {item.href ? (
              <Link className="lpv-a-breadcrumbs__link" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="lpv-a-breadcrumbs__current">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

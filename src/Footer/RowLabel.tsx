'use client'
import { Footer } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

type NavItem = NonNullable<Footer['navItems']>[number]
type Column = NonNullable<Footer['columns']>[number]

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NavItem>()

  const numero = data?.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const label = data?.data?.link?.label

  return <div>{label ? `Lien ${numero} : ${label}` : `Lien ${numero}`}</div>
}

export const ColumnRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<Column>()

  const numero = data?.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const title = data?.data?.title

  return <div>{title ? `Colonne ${numero} : ${title}` : `Colonne ${numero}`}</div>
}

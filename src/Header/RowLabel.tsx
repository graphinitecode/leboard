'use client'
import { Header } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

type NavItem = NonNullable<Header['navItems']>[number]

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NavItem>()

  const numero = data?.rowNumber !== undefined ? data.rowNumber + 1 : ''

  if (data?.data?.typeItem === 'dropdown') {
    const label = data?.data?.dropdown?.label
    return <div>{label ? `Dropdown ${numero} : ${label}` : `Dropdown ${numero}`}</div>
  }

  const label = data?.data?.link?.label
  return <div>{label ? `Lien ${numero} : ${label}` : `Lien ${numero}`}</div>
}
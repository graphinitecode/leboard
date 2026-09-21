'use client'

import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

// Boutons du panel et du site vitrine : les classes du design system LPV
// (lpv-bouton, cf. docs/design-system.md §3) remplacent les variants shadcn.
// Les libellés de variants sont conservés pour ne pas casser les call sites.
const buttonVariants = cva('', {
  variants: {
    variant: {
      default: 'lpv-bouton',
      destructive: 'lpv-bouton lpv-bouton--danger',
      outline: 'lpv-bouton lpv-bouton--secondaire',
      secondary: 'lpv-bouton lpv-bouton--secondaire',
      ghost: 'lpv-bouton lpv-bouton--secondaire',
      link: 'lpv-lien-inline',
    },
    size: {
      clear: '',
      default: '',
      sm: 'lpv-bouton--petit',
      lg: 'lpv-bouton--grand',
      icon: 'lpv-bouton--icone',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button: React.FC<ButtonProps> = ({ asChild = false, className, size, variant, ...props }) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
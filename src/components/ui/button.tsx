'use client'

import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

// Boutons du panel et du site vitrine : les classes du design system LPV
// (lpv-a-button, cf. docs/design-system.md §3) remplacent les variants shadcn.
// Les libellés de variants sont conservés pour ne pas casser les call sites.
const buttonVariants = cva('', {
  variants: {
    variant: {
      default: 'lpv-a-button',
      destructive: 'lpv-a-button lpv-a-button--danger',
      success: 'lpv-a-button lpv-a-button--success',
      outline: 'lpv-a-button lpv-a-button--secondary',
      secondary: 'lpv-a-button lpv-a-button--secondary',
      ghost: 'lpv-a-button lpv-a-button--secondary',
      link: 'lpv-link-inline',
    },
    size: {
      clear: '',
      default: '',
      sm: 'lpv-a-button--petit',
      lg: 'lpv-a-button--grand',
      icon: 'lpv-a-button--icon',
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

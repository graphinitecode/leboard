'use client'

import { Button } from '@/components/atoms/a-button'

// Atome : ouvre la boîte d'impression du navigateur (impression ou PDF).
export function PrintButton({ children = 'Imprimer ou enregistrer en PDF' }: { children?: string }) {
  return (
    <Button onClick={() => window.print()} type="button" variant="secondary">
      {children}
    </Button>
  )
}

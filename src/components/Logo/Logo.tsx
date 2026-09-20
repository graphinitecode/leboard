import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

// Atome : logo LPV Board « large » (cœur + mention Association Les Pierres
// Vivantes), blanc, pour fond coloré — header du site vitrine.
export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Association Les Pierres Vivantes"
      width={499}
      height={93}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('w-full h-auto max-w-[17rem]', className)}
      src="/lpv-logo_large.png"
    />
  )
}
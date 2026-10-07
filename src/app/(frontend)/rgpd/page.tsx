import configPromise from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'

import { AppShell } from '@/components/templates'
import { AppFooter } from '@/Footer/Component'

export const dynamic = 'force-dynamic'

export default async function RGPDPage() {
  const payload = await getPayload({ config: configPromise })
  const politique = await payload.findGlobal({ slug: 'politique-rgpd' })

  return (
    <AppShell footer={<AppFooter />} homeHref="/">
      <h1 className="lpv-h1">Politique de protection des données</h1>
      {politique?.contenu ? (
        <RichText data={politique.contenu} />
      ) : (
        <p className="lpv-muted">La politique de protection des données n&rsquo;est pas encore publiée.</p>
      )}
      <p className="lpv-muted">
        Version {politique?.version ?? '—'} · publiée le{' '}
        {politique?.datePublication
          ? new Date(politique.datePublication).toLocaleDateString('fr-FR')
          : '—'}
      </p>
    </AppShell>
  )
}
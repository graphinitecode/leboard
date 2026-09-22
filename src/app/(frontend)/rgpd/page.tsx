import configPromise from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'

import { PageContent, ServiceHeader } from '@/components/molecules/m-service-header'

export const dynamic = 'force-dynamic'

export default async function RGPDPage() {
  const payload = await getPayload({ config: configPromise })
  const politique = await payload.findGlobal({ slug: 'politique-rgpd' })

  return (
    <PageContent
      header={
        <ServiceHeader
          heroTitle="Politique de protection des données"
          legalLinks={[{ href: '/rgpd', label: 'Protection des données' }]}
          services={[{ href: '/rgpd', label: 'Protection des données' }]}
        />
      }
      footerLinks={[]}
    >
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
    </PageContent>
  )
}
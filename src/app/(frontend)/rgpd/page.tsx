import configPromise from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export default async function RGPDPage() {
  const payload = await getPayload({ config: configPromise })
  const politique = await payload.findGlobal({ slug: 'politique-rgpd' })

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Politique de protection des données</h1>
      {politique?.contenu ? (
        <RichText data={politique.contenu} />
      ) : (
        <p>La politique de protection des données n’est pas encore publiée.</p>
      )}
      <p>
        <small>
          Version {politique?.version ?? '—'} · publiée le{' '}
          {politique?.datePublication
            ? new Date(politique.datePublication).toLocaleDateString('fr-FR')
            : '—'}
        </small>
      </p>
    </main>
  )
}
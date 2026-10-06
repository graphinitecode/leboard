import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Alertes } from './collections/Alertes'
import { Competences } from './collections/Competences'
import { Creneaux } from './collections/Creneaux'
import { Eleves } from './collections/Eleves'
import { Exemplaires } from './collections/Exemplaires'
import { Livres } from './collections/Livres'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Presences } from './collections/Presences'
import { Prets } from './collections/Prets'
import { Progressions } from './collections/Progressions'
import { Seances } from './collections/Seances'
import { Series } from './collections/Series'
import { Users } from './collections/Users'
import { PolitiqueRgpd } from './globals/PolitiqueRgpd'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { AUTOLOGIN_EMAIL } from '@/shared/auto-login'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    // Connexion auto réservée au développement : en production, tout visiteur
    // serait authentifié avec ce compte
    autoLogin: process.env.NODE_ENV === 'development' ? { email: AUTOLOGIN_EMAIL } : false,
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    // La base locale est celle de production : le schéma n'évolue que par
    // migrations (src/migrations), jamais par la synchronisation du mode dev
    push: false,
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [
    // Collections métier (association)
    Alertes,
    Eleves,
    Seances,
    Series,
    Presences,
    Progressions,
    Competences,
    Livres,
    Exemplaires,
    Prets,
    Creneaux,
    // Collections du template (site vitrine, à retirer plus tard)
    Pages,
    Posts,
    Media,
    Categories,
    Users,
  ],
  // Emails (Resend) : activé seulement si la clé est présente — sans adapter,
  // Payload écrit les emails dans la console (dev/tests).
  ...(process.env.RESEND_API_KEY
    ? {
        email: resendAdapter({
          apiKey: process.env.RESEND_API_KEY,
          defaultFromAddress: process.env.RESEND_FROM_EMAIL || '',
          defaultFromName: 'Association Les Pierres Vivantes',
        }),
      }
    : {}),
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, PolitiqueRgpd],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})

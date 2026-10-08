import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // Les rapports vivent dans l'espace profs depuis la spec 23
  const rapportsRedirects = [
    { destination: '/profs/rapports', permanent: true, source: '/rapports' },
    { destination: '/profs/rapports/:path*', permanent: true, source: '/rapports/:path*' },
  ]

  return [internetExplorerRedirect, ...rapportsRedirects]
}

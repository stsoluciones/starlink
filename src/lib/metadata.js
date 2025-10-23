// src/lib/metadata.js
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar';

export const defaultMetadata = {
  // Hace que los paths relativos se resuelvan como URLs absolutas en Next
  metadataBase: new URL(SITE),

  title: 'SLSoluciones | Fuente elevadora para Starlink Mini en Argentina',
  description:
    ' En SL Soluciones existen accesorios para StarLink como: Fuente elevadora para Starlink Mini: alimentación estable y portable para internet satelital. Ideal para viajes y zonas rurales. Envíos gratis a todo el país. ',
  keywords: [
    'Starlink Mini',
    'fuente elevadora',
    'internet satelital',
    'Argentina',
    'WiFi portátil',
    'conexión rural',
    'SLS Soluciones'
  ].join(', '),
  charSet: 'UTF-8',

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png' // ideal 180x180
  },

  manifest: '/manifest.json',

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },

  authors: [
    { name: 'SLS', url: SITE },
    { name: 'Gonzalo Torres Grau', url: 'https://gonzalotorresgrau.com' }
  ],
  publisher: 'SLSoluciones | Internet Satelital y Conectividad',

  alternates: {
    canonical: SITE + '/',
    languages: {
      'es-AR': SITE + '/'
    }
  },

  openGraph: {
    title: 'SLSoluciones | Fuente elevadora para Starlink Mini en Argentina',
    description:
      'Alimentación confiable para Starlink Mini. Compacta, eficiente y lista para tus viajes. Envíos gratis a todo el país.',
    type: 'website',
    url: SITE + '/',
    siteName: 'SLS Soluciones',
    locale: 'es_AR',
    images: [
      {
        url: SITE + '/og/og-sls-starlink-mini.jpg', // 1200x630 recomendado
        width: 1200,
        height: 630,
        alt: 'Fuente elevadora para Starlink Mini - SLSoluciones'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    site: '@slsoluciones',
    title: 'SLSoluciones | Fuente para Starlink Mini en Argentina',
    description:
      'Fuente elevadora para Starlink Mini. Compacta, eficiente y perfecta para zonas sin conectividad fija.',
    images: [SITE + '/og/og-sls-starlink-mini.jpg']
  },

  // Structured Data base (Organization + WebSite). Esto ayuda a Google entender entidad y marca.
  other: {
    'script:ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': SITE + '#org',
          name: 'SLSoluciones',
          url: SITE,
          logo: SITE + '/logos/logo.webp',
          sameAs: [
            'https://www.facebook.com/slsoluciones',
            'https://www.instagram.com/slsoluciones',
            'https://twitter.com/slsoluciones'
          ],
          contactPoint: [
            {
              '@type': 'ContactPoint',
              telephone: '+54-11-0000-0000',
              contactType: 'customer service',
              areaServed: 'AR',
              availableLanguage: ['es', 'en']
            }
          ]
        },
        {
          '@type': 'WebSite',
          '@id': SITE + '#website',
          url: SITE,
          name: 'SLSoluciones',
          publisher: { '@id': SITE + '#org' },
          potentialAction: {
            '@type': 'SearchAction',
            target: SITE + 'productos?search={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'BreadcrumbList',
          '@id': SITE + '#breadcrumbs',
          itemListElement: [
            { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': SITE },
            { '@type': 'ListItem', 'position': 2, 'name': 'Productos', 'item': SITE + 'productos' }
          ]
        }
      ]
    })
  }
};

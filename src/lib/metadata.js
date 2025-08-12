// src/lib/metadata.js
export const defaultMetadata = {
  title: 'SLSoluciones | Fuente elevadora para Starlink Mini en Argentina',
  description:
    'Fuente elevadora para Starlink Mini: alimentación estable y portable para internet satelital. Ideal para viajes y zonas rurales. Envíos gratis a todo el país.',
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

  // Si usás Next 13/14 con "metadataBase", aprovechá URLs absolutas:
  // metadataBase: new URL('https://slsoluciones.com.ar'),

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

  authors: [{ name: 'SLS', url: 'https://slsoluciones.com.ar' }, {name:'Gonzalo Torres Grau', url: 'https://gonzalotorresgrau.com'}],
  publisher: 'SLSoluciones | Internet Satelital y Conectividad',

  alternates: {
    canonical: 'https://slsoluciones.com.ar/',
    languages: {
      'es-AR': 'https://slsoluciones.com.ar/'
    }
  },

  openGraph: {
    title: 'SLSoluciones | Fuente elevadora para Starlink Mini en Argentina',
    description:
      'Alimentación confiable para Starlink Mini. Compacta, eficiente y lista para tus viajes. Envíos gratis a todo el país.',
    type: 'website',
    url: 'https://slsoluciones.com.ar/',
    siteName: 'SLS Soluciones',
    locale: 'es_AR',
    images: [
      {
        url: 'https://slsoluciones.com.ar/og/og-sls-starlink-mini.jpg', // 1200x630 recomendado
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
    images: ['https://slsoluciones.com.ar/og/og-sls-starlink-mini.jpg']
  },

  // Opcional pero útil para mobile/brand color en navegadores
  themeColor: '#F3781B'
};

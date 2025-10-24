// app/layout.tsx
import React from 'react';
import './globals.css';
import dynamic from 'next/dynamic';
import { ShoppingCartProvider } from '../components/Context/ShoopingCartContext';
import Script from 'next/script';

// Toaster: client-only to keep it out of the server bundle
const ToastClient = dynamic(() => import('../components/Client/ToastClient'), { ssr: false });

// env
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar';
const GA_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-JCX658JJ06';
const isProd = process.env.NODE_ENV === 'production';

export const metadata = {
  metadataBase: new URL(SITE),
  title: 'SLS Soluciones',
  description: 'Internet satelital y soluciones de conectividad en Argentina.',
  icons: { icon: [{ url: '/favicon.ico' }], apple: [{ url: '/apple-touch-icon.png' }] },
  manifest: '/manifest.json',
  alternates: { canonical: SITE },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 3,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

type Props = { children: React.ReactNode };

export default function RootLayout({ children }: Props) {
  return (
    <html lang="es-AR" dir="ltr">
      <head>
        {/* Perf hints */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />

        {/* Preload imágenes importantes para LCP */}
        <link rel="preload" as="image" href="https://res.cloudinary.com/dtfibzv3v/image/upload/f_auto,q_auto,w_1600/v1747603752/conector_zh1hpb.webp" />
        <link rel="preload" as="image" href="https://res.cloudinary.com/dtfibzv3v/image/upload/f_auto,q_auto,w_1600/v1747603345/antena_cvb9w0.webp" />
        <link rel="preload" as="image" href="https://res.cloudinary.com/dtfibzv3v/image/upload/f_auto,q_auto,w_1600/v1747603344/auto_qldyxb.webp" />
        <link rel="preload" as="image" href="https://res.cloudinary.com/dtfibzv3v/image/upload/f_auto,q_auto,w_1600/v1747603344/antenaEnAuto_xw3yhy.webp" />
      </head>

      <body className="min-h-screen antialiased" data-theme="light">
        {/* ------------------------
            Google Analytics (GA4)
            Cargamos sólo en producción y como lazyOnload para no bloquear
            ------------------------ */}
        {isProd && GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="lazyOnload"
            />
            <Script
              id="ga4-config"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}

        {/* Cloudinary widget: NO incluirlo globalmente si no se usa en todas las páginas.
            Si lo necesitás global, descomentar la siguiente línea. 
            Mejor opción: importarlo dinámicamente dentro del componente que usa el widget. */}
        {/* <Script src="https://widget.cloudinary.com/v2.0/global/all.js" strategy="lazyOnload" /> */}

        <ShoppingCartProvider>
          {children}
          <ToastClient />
        </ShoppingCartProvider>
      </body>
    </html>
  );
}

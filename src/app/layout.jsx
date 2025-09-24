// app/layout.tsx (o .jsx)
import React from 'react';
import './globals.css';
// Toaster is provided by the client-only ToastClient component
import dynamic from 'next/dynamic';
import { ShoppingCartProvider } from '../components/Context/ShoopingCartContext';
import Script from 'next/script';

// Load Toaster on client only to keep it out of the server/first bundle
const ToastClient = dynamic(() => import('../components/Client/ToastClient'), { ssr: false });
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar';

export const metadata = {
  metadataBase: new URL(SITE),
  title: 'SLS Soluciones',
  description: 'Internet satelital y soluciones de conectividad en Argentina.',
  icons: {
    icon: [{ url: '/favicon.ico' }],
    apple: [{ url: '/apple-touch-icon.png' }], // 180x180 recomendado
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: SITE,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 3,
  viewportFit: 'cover',
  themeColor: '#ffffff',

};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR" dir="ltr">
      <head>
        {/* Perf hints */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <Script src="https://widget.cloudinary.com/v2.0/global/all.js" strategy="lazyOnload" />
        <link rel="dns-prefetch" href="https://widget.cloudinary.com" />
        <link rel="preconnect" href="https://widget.cloudinary.com" crossOrigin="" />
        <link rel="preload" as="image" href="https://res.cloudinary.com/dtfibzv3v/image/upload/f_auto,q_auto,w_1600/v1747603752/conector_zh1hpb.webp" />

      </head>
          <body className="min-h-screen antialiased" data-theme="light">
        {/* GA4: cargar la librería primero */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JCX658JJ06"
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
              gtag('config', 'G-JCX658JJ06', { page_path: window.location.pathname });
            `,
          }}
        />

        {/* Cloudinary (como tenías) */}
        <Script src="https://widget.cloudinary.com/v2.0/global/all.js" strategy="afterInteractive" />

        <ShoppingCartProvider>
          {children}
          <ToastClient />
        </ShoppingCartProvider>
      </body>
    </html>
  );
}

// app/layout.tsx (o .jsx)
import React from 'react';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ShoppingCartProvider } from '../components/Context/ShoopingCartContext';
import Script from 'next/script';

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
  themeColor: '#ffffff',
  alternates: {
    canonical: SITE,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR" dir="ltr">
      <head>
        {/* Perf hints */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://widget.cloudinary.com" />
        <link rel="preconnect" href="https://widget.cloudinary.com" crossOrigin="" />
      </head>

      <body className="min-h-screen antialiased" data-theme="light">
        {/* GA4: cargar la librería primero */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JCX658JJ06"
          strategy="afterInteractive"
        />
        <Script
          id="ga4-config"
          strategy="afterInteractive"
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
        <Script src="https://widget.cloudinary.com/v2.0/global/all.js" strategy="beforeInteractive" />

        <ShoppingCartProvider>
          {children}
          <Toaster />
        </ShoppingCartProvider>
      </body>
    </html>
  );
}

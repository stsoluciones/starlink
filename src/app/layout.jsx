import React from 'react';
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ShoppingCartProvider } from '../components/Context/ShoopingCartContext';
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="theme-color" content="#007BC7" />
        
        {/* ✅ Solo mantenemos los íconos y manifest */}
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />

        {/* ✅ Mantén scripts pero sin duplicar metadatos */}
        <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7LRLRDC81W', {
                page_path: window.location.pathname,
              });
          `,
        }}/>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-7LRLRDC81W" strategy="afterInteractive"/>
      </head>
      <body>
        <ShoppingCartProvider>
          {children}
          <Toaster />
        </ShoppingCartProvider>
      </body>
    </html>
  );
}

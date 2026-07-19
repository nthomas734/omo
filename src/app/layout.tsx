import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RegisterSW } from '@/components/RegisterSW';

export const metadata: Metadata = {
  title: 'omo',
  description: '— nothing decided lightly —',
  // ?v=2 busts iOS's cached manifest — background_color is baked into the
  // home-screen icon at add time (it paints the strip under the bottom tab
  // bar) and iOS reuses a stale cached manifest even on re-add. Bump the
  // query any time manifest.json changes.
  manifest: '/manifest.json?v=2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'omo',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#162E38',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Geist+Mono:wght@400;500;700&family=Manrope:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { IdentityProvider } from '@/context/IdentityContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Scrutinder — Swipez le programme',
  description:
    "Evaluez les mesures de L'Avenir en Commun en swipant. Sondage transparent, chiffre localement.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Scrutinder',
  },
  openGraph: {
    title: 'Scrutinder',
    description: "Swipez le programme politique, mesurez l'adhesion populaire.",
    type: 'website',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-slate-950 text-white antialiased min-h-screen">
        <IdentityProvider>{children}</IdentityProvider>
      </body>
    </html>
  )
}

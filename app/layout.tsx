import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { IdentityProvider } from '@/context/IdentityContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Scrutinder — Swipez le programme',
  description: 'Évaluez les mesures de L\'Avenir en Commun en swipant. Sondage transparent, chiffré localement.',
  openGraph: {
    title: 'Scrutinder',
    description: 'Swipez le programme politique, mesurez l\'adhésion populaire.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-slate-950 text-white antialiased min-h-screen">
        <IdentityProvider>
          {children}
        </IdentityProvider>
      </body>
    </html>
  )
}

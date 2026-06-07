import type { Metadata, Viewport } from 'next'
import { Anton, Oswald, Hanken_Grotesk } from 'next/font/google'
import { IdentityProvider } from '@/context/IdentityContext'
import { VotesProvider } from '@/context/VotesContext'
import { ToastProvider } from '@/components/ui/Toast'
import './globals.css'

// Affiche / titres massifs
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display' })
// Sur-titres / labels condensés
const oswald = Oswald({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-cond' })
// Texte courant / UI
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Parlement Populaire - Votez les mesures',
  description:
    "Découvrez, votez et débattez les mesures du programme L'Avenir en Commun. Votre voix reste locale et protégée.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Parlement Populaire',
  },
  openGraph: {
    title: 'Parlement Populaire',
    description: 'Votez les mesures. Mesurez l’adhésion populaire.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFCF4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${anton.variable} ${oswald.variable} ${hanken.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper text-ink font-sans antialiased min-h-screen">
        <ToastProvider>
          <IdentityProvider>
            <VotesProvider>{children}</VotesProvider>
          </IdentityProvider>
        </ToastProvider>
      </body>
    </html>
  )
}

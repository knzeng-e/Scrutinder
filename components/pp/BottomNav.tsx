'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from './Icon'

interface Tab {
  href: string
  label: string
  icon: IconName
  center?: boolean
  match: (path: string) => boolean
}

const TABS: Tab[] = [
  { href: '/', label: 'Accueil', icon: 'home', match: (p) => p === '/' },
  { href: '/programme', label: 'Programme', icon: 'book', match: (p) => p.startsWith('/programme') },
  { href: '/swipe', label: 'Voter', icon: 'cards', center: true, match: (p) => p.startsWith('/swipe') },
  { href: '/resultats', label: 'Résultats', icon: 'chart', match: (p) => p.startsWith('/resultats') },
  { href: '/compte', label: 'Compte', icon: 'user', match: (p) => p.startsWith('/compte') },
]

export function BottomNav() {
  const pathname = usePathname() || '/'

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto grid max-w-[440px] grid-cols-5 border-t-2 border-ink bg-paper safe-bottom"
      style={{ height: 84, padding: '8px 8px' }}
    >
      {TABS.map((t) => {
        const active = t.match(pathname)
        if (t.center) {
          return (
            <Link
              key={t.href}
              href={t.href}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold"
              style={{ color: active ? '#4C0297' : '#706F6F' }}
            >
              <span
                className="flex items-center justify-center border-2 border-ink text-white"
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 15,
                  marginTop: -22,
                  background: active ? '#D1271C' : '#4C0297',
                  boxShadow: active ? '3px 3px 0 #FFD2CF' : '3px 3px 0 #E5CBFF',
                }}
              >
                <Icon n={t.icon} s={24} />
              </span>
              <span>{t.label}</span>
            </Link>
          )
        }
        return (
          <Link
            key={t.href}
            href={t.href}
            className="relative flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold"
            style={{ color: active ? '#4C0297' : '#706F6F' }}
          >
            <Icon n={t.icon} s={23} />
            <span>{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

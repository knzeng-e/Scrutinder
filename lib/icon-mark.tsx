import type { ReactElement } from 'react'

// Élément JSX partagé pour générer l'icône Scrutinder via next/og ImageResponse.
// Utilisé par le favicon (app/icon.tsx) et les icônes PWA (app/icons/*).
export function iconMark(size: number): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: `${Math.round(size * 0.2)}px`,
      }}
    >
      <span
        style={{
          fontSize: `${Math.round(size * 0.66)}px`,
          fontWeight: 900,
          color: '#CC0A2B',
          fontFamily: 'sans-serif',
          lineHeight: 1,
        }}
      >
        S
      </span>
    </div>
  )
}

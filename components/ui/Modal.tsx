'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/cn'

interface ModalProps {
  onClose: () => void
  children: React.ReactNode
  /** Alignement vertical du panneau */
  align?: 'center' | 'bottom'
  /** Classe additionnelle sur le panneau */
  className?: string
  /** Libellé accessible du dialogue */
  label?: string
}

// Dialogue réutilisable : overlay + fermeture (clic extérieur, touche Échap),
// blocage du scroll de fond. Le contenu est fourni par l'appelant.
export function Modal({ onClose, children, align = 'center', className, label }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm p-4',
        align === 'bottom' ? 'items-end sm:items-center' : 'items-center'
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className={cn(
          'w-full max-w-md bg-surface border border-line rounded-3xl shadow-2xl',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

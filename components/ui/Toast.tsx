'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-green-700/60 text-green-300',
  error:   'border-red-700/60 text-red-300',
  info:    'border-line text-ink',
}

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = nextId.current++
    setToasts((t) => [...t, { id, message, variant }])
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Conteneur des toasts */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] flex flex-col items-center gap-2 p-4 pointer-events-none safe-bottom">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto bg-surface border rounded-2xl px-4 py-3 shadow-2xl text-sm flex items-center gap-2 max-w-md w-full sm:w-auto animate-[fadeIn_0.2s_ease-out]',
              VARIANT_STYLES[t.variant]
            )}
          >
            <span aria-hidden>{VARIANT_ICON[t.variant]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être utilisé dans <ToastProvider>')
  return ctx
}

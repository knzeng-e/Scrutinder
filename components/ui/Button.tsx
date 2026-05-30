'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-red-600 hover:bg-red-500 text-white',
  secondary: 'bg-surface2 hover:bg-surface3 text-ink',
  ghost:     'bg-transparent hover:bg-surface2 text-muted hover:text-ink',
  danger:    'bg-red-950/40 hover:bg-red-950/80 border border-red-800/40 text-red-400',
}

const SIZES: Record<Size, string> = {
  sm: 'py-2 px-3 text-sm rounded-xl',
  md: 'py-3 px-5 text-sm rounded-2xl',
  lg: 'py-4 px-6 text-base rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
})

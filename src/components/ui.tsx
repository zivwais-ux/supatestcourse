import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-[8px] px-3.5 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap'
  const variants: Record<string, string> = {
    primary: 'text-white shadow-sm',
    secondary: 'border',
    ghost: '',
    danger: 'text-white',
  }
  const style =
    variant === 'primary'
      ? { background: 'var(--accent)' }
      : variant === 'danger'
        ? { background: 'var(--danger)' }
        : variant === 'secondary'
          ? { borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--surface-raised)' }
          : { color: 'var(--text-secondary)' }
  return (
    <button
      {...props}
      style={style}
      className={`${base} ${variants[variant]} ${className}`}
      onMouseEnter={(e) => {
        if (variant === 'primary') (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'
        props.onMouseLeave?.(e)
      }}
    />
  )
}

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      {children}
      {error && (
        <span className="text-[12px]" style={{ color: 'var(--danger)' }}>
          {error}
        </span>
      )}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-[8px] border px-3 py-2 text-sm outline-none transition focus:ring-2 ${props.className ?? ''}`}
      style={{
        borderColor: 'var(--border)',
        background: 'var(--surface-raised)',
        color: 'var(--text-primary)',
        ...(props.style ?? {}),
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        props.onBlur?.(e)
      }}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-[8px] border px-3 py-2 text-sm outline-none transition ${props.className ?? ''}`}
      style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)', color: 'var(--text-primary)' }}
    />
  )
}

export function Badge({ tone, children }: { tone: 'neutral' | 'success' | 'warning' | 'danger' | 'accent'; children: string }) {
  const tones: Record<string, { bg: string; fg: string }> = {
    neutral: { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)' },
    success: { bg: 'var(--success-soft)', fg: 'var(--success)' },
    warning: { bg: 'var(--warning-soft)', fg: 'var(--warning)' },
    danger: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
    accent: { bg: 'var(--accent-soft)', fg: 'var(--accent)' },
  }
  const t = tones[tone]
  return (
    <span
      className="inline-flex items-center rounded-[6px] px-2 py-0.5 text-[12px] font-medium capitalize"
      style={{ background: t.bg, color: t.fg }}
    >
      {children.replace('_', ' ')}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius)] border ${className}`}
      style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)' }}
    >
      {children}
    </div>
  )
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative flex h-full w-full max-w-md flex-col border-l shadow-xl"
        style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-[6px] px-2 py-1 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ title, hint, action }: { title: string; hint: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {title}
      </p>
      <p className="max-w-xs text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
        {hint}
      </p>
      {action}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[6px] ${className}`} style={{ background: 'var(--surface-sunken)' }} />
}

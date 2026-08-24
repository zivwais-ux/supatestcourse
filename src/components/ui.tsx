import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius)] border ${className}`}
      style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
    >
      {children}
    </div>
  )
}

const TONES: Record<string, { bg: string; fg: string }> = {
  green: { bg: 'var(--success-soft)', fg: 'var(--success)' },
  gold: { bg: 'var(--gold-soft)', fg: 'var(--gold)' },
  blue: { bg: 'var(--info-soft)', fg: 'var(--info)' },
  red: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
  gray: { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)' },
}

export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: keyof typeof TONES }) {
  const t = TONES[tone] ?? TONES.gray
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium leading-none"
      style={{ background: t.bg, color: t.fg }}
    >
      {children}
    </span>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-[9px] border px-3 py-2 text-sm outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] ${props.className ?? ''}`}
      style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-[9px] border px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)] ${props.className ?? ''}`}
      style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    />
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 py-16 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
      {children}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

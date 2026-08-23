import { NavLink, Outlet } from 'react-router-dom'
import { Airplane, ChartLineUp, SignOut, Ticket, Users, MoonStars, Sun } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const NAV = [
  { to: '/', label: 'Dashboard', icon: ChartLineUp, end: true },
  { to: '/flights', label: 'Flights', icon: Airplane, end: false },
  { to: '/customers', label: 'Customers', icon: Users, end: false },
  { to: '/orders', label: 'Orders', icon: Ticket, end: false },
]

export function Layout({ email }: { email: string | undefined }) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark' | null) ?? null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme)
      try {
        localStorage.setItem('theme', theme)
      } catch {
        /* ignore */
      }
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])

  return (
    <div className="flex h-full min-h-[100dvh]">
      <aside
        className="flex w-60 shrink-0 flex-col border-r px-3 py-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-2 px-2 pb-6 pt-1">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[8px]"
            style={{ background: 'var(--accent)' }}
          >
            <Airplane size={18} weight="fill" color="white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Skyline CRM</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13.5px] font-medium transition ${isActive ? '' : ''}`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
              })}
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-1">
            <span className="truncate text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              {email}
            </span>
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              className="rounded-[6px] p-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <MoonStars size={16} />}
            </button>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13.5px] font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            <SignOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scrollbar-thin px-8 py-7">
        <Outlet />
      </main>
    </div>
  )
}

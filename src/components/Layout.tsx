import { NavLink, Outlet } from 'react-router-dom'
import { Buildings, ChartLineUp, House, Users } from '@phosphor-icons/react'

const NAV = [
  { to: '/', label: 'לוח בקרה', icon: ChartLineUp, end: true },
  { to: '/listings', label: 'נכסים', icon: House, end: false },
  { to: '/clients', label: 'לקוחות', icon: Users, end: false },
  { to: '/cities', label: 'מכירות לפי עיר', icon: Buildings, end: false },
]

export function Layout() {
  return (
    <div className="flex min-h-[100dvh]" style={{ background: 'var(--surface)' }}>
      <aside
        className="sticky top-0 hidden h-[100dvh] w-[248px] shrink-0 flex-col border-l md:flex"
        style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[15px] font-bold text-white"
            style={{ background: 'var(--accent)' }}
          >
            ג״נ
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold">גולדשטיין נדל״ן</div>
            <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              זכרון יעקב והסביבה
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-sm font-medium transition"
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              })}
            >
              <Icon size={19} weight="duotone" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-5 py-5 text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          מערכת ניהול לקוחות ונכסים
          <br />
          נתוני הדגמה
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3 md:hidden"
          style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[13px] font-bold text-white"
            style={{ background: 'var(--accent)' }}
          >
            ג״נ
          </div>
          <span className="text-sm font-bold">גולדשטיין נדל״ן</span>
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b px-3 py-2 md:hidden"
          style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
        >
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium"
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 md:px-8 md:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

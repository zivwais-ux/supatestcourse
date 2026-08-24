import { useEffect, useState } from 'react'
import { CurrencyCircleDollar, House, Trophy, Users } from '@phosphor-icons/react'
import { supabase } from '../lib/supabase'
import type { CityMonthlySale, Client, Listing } from '../lib/types'
import { hebrewMonth, shekel, shekelShort } from '../lib/format'
import { Badge, Card, PageHeader, Spinner } from '../components/ui'

const ACTIVE_LISTING = ['למכירה', 'בבלעדיות', 'להשכרה', 'במשא ומתן']
const OPEN_CLIENT = ['ליד חדש', 'בטיפול', 'סיור מתוכנן', 'במשא ומתן']

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'var(--accent)',
}: {
  icon: typeof House
  label: string
  value: string
  hint?: string
  tone?: string
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <Icon size={19} weight="duotone" style={{ color: tone }} />
      </div>
      <div className="num text-[24px] font-bold leading-none">{value}</div>
      {hint && (
        <div className="mt-1.5 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
          {hint}
        </div>
      )}
    </Card>
  )
}

export function Dashboard() {
  const [listings, setListings] = useState<Listing[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [sales, setSales] = useState<CityMonthlySale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('listings').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('city_monthly_sales').select('*').order('month', { ascending: false }),
    ]).then(([l, c, s]) => {
      setListings(l.data ?? [])
      setClients(c.data ?? [])
      setSales(s.data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  const active = listings.filter((l) => ACTIVE_LISTING.includes(l.status))
  const sold = listings.filter((l) => l.status === 'נמכר')
  const openClients = clients.filter((c) => OPEN_CLIENT.includes(c.status))
  const portfolio = active.reduce((s, l) => s + l.price, 0)

  const latestMonth = sales[0]?.month
  const monthRows = sales.filter((s) => s.month === latestMonth).sort((a, b) => b.houses_sold - a.houses_sold)
  const topCity = monthRows[0]

  // חמשת הנכסים היקרים ביותר שפעילים כרגע בתיק
  const featured = [...active].sort((a, b) => b.price - a.price).slice(0, 5)
  const hotClients = openClients.filter((c) => c.status === 'במשא ומתן' || c.status === 'סיור מתוכנן').slice(0, 5)

  return (
    <>
      <PageHeader title="לוח בקרה" subtitle="גולדשטיין נדל״ן · תיווך, השקעות וייעוץ בזכרון יעקב והסביבה" />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={House} label="נכסים פעילים" value={String(active.length)} hint={`מתוך ${listings.length} בתיק המשרד`} />
        <Stat icon={Users} label="לקוחות פתוחים" value={String(openClients.length)} hint={`מתוך ${clients.length} לקוחות`} tone="var(--info)" />
        <Stat icon={CurrencyCircleDollar} label="שווי תיק הנכסים" value={shekelShort(portfolio)} hint="סך הנכסים הפעילים" tone="var(--gold)" />
        <Stat icon={Trophy} label="עסקאות שנסגרו" value={String(sold.length)} hint="נכסים שנמכרו השנה" tone="var(--success)" />
      </div>

      {topCity && (
        <Card className="mb-4 overflow-hidden">
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5"
            style={{ background: 'var(--surface-sunken)', borderColor: 'var(--border)' }}
          >
            <span className="text-[15px] font-bold">העיר המובילה · {hebrewMonth(topCity.month)}</span>
            <Badge tone="gold">
              <Trophy size={13} weight="fill" className="ms-1 inline" />
              {topCity.city}
            </Badge>
          </div>
          <div className="grid gap-px sm:grid-cols-3" style={{ background: 'var(--border)' }}>
            {[
              { label: 'בתים שנמכרו', value: String(topCity.houses_sold) },
              { label: 'מחיר ממוצע', value: shekel(topCity.avg_price) },
              { label: 'מחזור חודשי', value: shekel(topCity.total_volume) },
            ].map((cell) => (
              <div key={cell.label} className="px-5 py-4" style={{ background: 'var(--surface-raised)' }}>
                <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {cell.label}
                </div>
                <div className="num mt-1 text-[19px] font-bold">{cell.value}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b px-5 py-3.5 text-[15px] font-bold" style={{ borderColor: 'var(--border)' }}>
            נכסים מובילים בתיק
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {featured.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium">{l.title}</div>
                  <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {[l.neighborhood, l.city].filter(Boolean).join(', ')} · {l.agent}
                  </div>
                </div>
                <div className="num shrink-0 text-[14px] font-semibold" style={{ color: 'var(--accent)' }}>
                  {shekelShort(l.price)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b px-5 py-3.5 text-[15px] font-bold" style={{ borderColor: 'var(--border)' }}>
            לקוחות בשלב מתקדם
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {hotClients.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                אין לקוחות בשלב מתקדם כרגע
              </div>
            ) : (
              hotClients.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium">{c.full_name}</div>
                    <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      {c.client_type} · {c.preferred_city ?? '—'} · {c.agent}
                    </div>
                  </div>
                  <Badge tone="gold">{c.status}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  )
}

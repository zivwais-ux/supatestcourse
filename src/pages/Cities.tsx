import { useEffect, useMemo, useState } from 'react'
import { Trophy } from '@phosphor-icons/react'
import { supabase } from '../lib/supabase'
import type { CityMonthlySale } from '../lib/types'
import { hebrewMonth, shekel, shekelShort } from '../lib/format'
import { Badge, Card, PageHeader, Spinner } from '../components/ui'

export function Cities() {
  const [rows, setRows] = useState<CityMonthlySale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('city_monthly_sales')
      .select('*')
      .order('month', { ascending: false })
      .order('houses_sold', { ascending: false })
      .then(({ data }) => {
        setRows(data ?? [])
        setLoading(false)
      })
  }, [])

  // קיבוץ לפי חודש, כשהעיר המובילה נשמרת בראש כל קבוצה
  const months = useMemo(() => {
    const map = new Map<string, CityMonthlySale[]>()
    for (const r of rows) {
      const list = map.get(r.month) ?? []
      list.push(r)
      map.set(r.month, list)
    }
    return [...map.entries()].map(([month, cities]) => ({
      month,
      cities: [...cities].sort((a, b) => b.houses_sold - a.houses_sold),
    }))
  }, [rows])

  const maxSold = Math.max(1, ...rows.map((r) => r.houses_sold))

  if (loading) return <Spinner />

  return (
    <>
      <PageHeader
        title="מכירות לפי עיר"
        subtitle="העיר שמכרה את מספר הבתים הגבוה ביותר בכל חודש, לפי נתוני האזור"
      />

      <div className="flex flex-col gap-4">
        {months.map(({ month, cities }) => {
          const top = cities[0]
          return (
            <Card key={month} className="overflow-hidden">
              <div
                className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5"
                style={{ background: 'var(--surface-sunken)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[15px] font-bold">{hebrewMonth(month)}</span>
                  <Badge tone="gold">
                    <Trophy size={13} weight="fill" className="ms-1 inline" />
                    {top.city}
                  </Badge>
                </div>
                <div className="num text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  סה״כ {cities.reduce((s, c) => s + c.houses_sold, 0)} עסקאות ·{' '}
                  {shekelShort(cities.reduce((s, c) => s + c.total_volume, 0))}
                </div>
              </div>

              <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                {cities.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                    <div className="flex w-[150px] items-center gap-2">
                      {c.is_top_city && (
                        <Trophy size={15} weight="fill" style={{ color: 'var(--gold)' }} />
                      )}
                      <span className={c.is_top_city ? 'font-semibold' : ''}>{c.city}</span>
                    </div>

                    <div className="flex min-w-[160px] flex-1 items-center gap-3">
                      <div
                        className="h-2 flex-1 overflow-hidden rounded-full"
                        style={{ background: 'var(--surface-sunken)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(c.houses_sold / maxSold) * 100}%`,
                            background: c.is_top_city ? 'var(--gold)' : 'var(--accent)',
                          }}
                        />
                      </div>
                      <span className="num w-[70px] text-[13px] font-medium">{c.houses_sold} בתים</span>
                    </div>

                    <div className="num w-[120px] text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                      ממוצע {shekelShort(c.avg_price)}
                    </div>
                    <div className="num w-[130px] text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {shekel(c.total_volume)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}

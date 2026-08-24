import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Listing, ListingStatus } from '../lib/types'
import { hebrewDate, shekel } from '../lib/format'
import { Badge, Card, Empty, Input, PageHeader, Select, Spinner } from '../components/ui'

const STATUS_TONE: Record<ListingStatus, 'green' | 'gold' | 'blue' | 'red' | 'gray'> = {
  'למכירה': 'blue',
  'בבלעדיות': 'gold',
  'להשכרה': 'blue',
  'במשא ומתן': 'gold',
  'נמכר': 'green',
  'הושכר': 'green',
}

export function Listings() {
  const [rows, setRows] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('הכל')
  const [city, setCity] = useState('הכל')

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .order('listed_at', { ascending: false })
      .then(({ data }) => {
        setRows(data ?? [])
        setLoading(false)
      })
  }, [])

  const cities = useMemo(() => ['הכל', ...new Set(rows.map((r) => r.city))], [rows])

  const filtered = rows.filter((r) => {
    if (status !== 'הכל' && r.status !== status) return false
    if (city !== 'הכל' && r.city !== city) return false
    if (!query) return true
    const q = query.trim()
    return [r.title, r.city, r.neighborhood, r.street, r.agent].some((f) => f?.includes(q))
  })

  return (
    <>
      <PageHeader title="נכסים" subtitle={`${rows.length} נכסים בתיק המשרד`} />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="min-w-[220px] flex-1">
          <Input placeholder="חיפוש לפי כתובת, שכונה או סוכן…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          {['הכל', 'למכירה', 'בבלעדיות', 'להשכרה', 'במשא ומתן', 'נמכר', 'הושכר'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Card>
          <Empty>לא נמצאו נכסים התואמים את החיפוש</Empty>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((l) => (
            <Card key={l.id} className="flex flex-col p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge>
                <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  {l.property_type}
                </span>
              </div>

              <h3 className="text-[15px] font-semibold leading-snug">{l.title}</h3>
              <p className="mt-1 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {[l.street, l.neighborhood, l.city].filter(Boolean).join(', ')}
              </p>

              <div className="my-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {l.rooms != null && <span>{l.rooms} חדרים</span>}
                {l.size_sqm != null && <span className="num">{l.size_sqm} מ״ר</span>}
                {l.lot_sqm != null && <span className="num">מגרש {l.lot_sqm} מ״ר</span>}
                {l.floor != null && <span>קומה {l.floor}</span>}
              </div>

              {l.description && (
                <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  {l.description}
                </p>
              )}

              <div
                className="mt-auto flex items-end justify-between gap-2 border-t pt-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <div className="num text-[17px] font-bold" style={{ color: 'var(--accent)' }}>
                    {shekel(l.price)}
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    פורסם {hebrewDate(l.listed_at)}
                  </div>
                </div>
                <div className="text-left text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {l.agent}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

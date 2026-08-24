import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Client, ClientStatus } from '../lib/types'
import { shekelShort } from '../lib/format'
import { Badge, Card, Empty, Input, PageHeader, Select, Spinner } from '../components/ui'

const STATUS_TONE: Record<ClientStatus, 'green' | 'gold' | 'blue' | 'red' | 'gray'> = {
  'ליד חדש': 'blue',
  'בטיפול': 'gold',
  'סיור מתוכנן': 'gold',
  'במשא ומתן': 'gold',
  'נסגר': 'green',
  'לא רלוונטי': 'gray',
}

function budget(c: Client): string {
  if (c.budget_min == null && c.budget_max == null) return '—'
  if (c.budget_min != null && c.budget_max != null) return `${shekelShort(c.budget_min)} – ${shekelShort(c.budget_max)}`
  return shekelShort((c.budget_max ?? c.budget_min) as number)
}

export function Clients() {
  const [rows, setRows] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('הכל')

  useEffect(() => {
    supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRows(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = rows.filter((c) => {
    if (status !== 'הכל' && c.status !== status) return false
    if (!query) return true
    const q = query.trim()
    return [c.full_name, c.phone, c.email, c.agent, c.preferred_city].some((f) => f?.includes(q))
  })

  return (
    <>
      <PageHeader title="לקוחות" subtitle={`${rows.length} לקוחות פעילים במערכת`} />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="min-w-[220px] flex-1">
          <Input placeholder="חיפוש לפי שם, טלפון או סוכן…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          {['הכל', 'ליד חדש', 'בטיפול', 'סיור מתוכנן', 'במשא ומתן', 'נסגר', 'לא רלוונטי'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Card>
          <Empty>לא נמצאו לקוחות התואמים את החיפוש</Empty>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }}>
                  {['לקוח', 'סוג', 'סטטוס', 'תקציב', 'אזור מבוקש', 'סוכן מטפל', 'מקור'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-[12px] font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t align-top" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.full_name}</div>
                      <div className="num text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        {c.phone}
                      </div>
                      {c.notes && (
                        <div className="mt-1 max-w-[280px] text-[12px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                          {c.notes}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {c.client_type}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="num whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {budget(c)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {c.preferred_city ?? '—'}
                      {c.preferred_rooms != null && (
                        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                          {' '}· {c.preferred_rooms} חד׳
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {c.agent}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      {c.source ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}

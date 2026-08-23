import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MagnifyingGlass, Pencil, Plus, Trash } from '@phosphor-icons/react'
import { supabase } from '../lib/supabase'
import type { Flight, FlightStatus } from '../lib/types'
import { Badge, Button, Card, Drawer, EmptyState, Field, Input, Select, Skeleton } from '../components/ui'

const STATUS_TONE: Record<FlightStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'accent'> = {
  scheduled: 'accent',
  boarding: 'warning',
  departed: 'neutral',
  landed: 'success',
  delayed: 'warning',
  cancelled: 'danger',
}

const emptyForm = {
  flight_number: '',
  origin: '',
  destination: '',
  departure_time: '',
  arrival_time: '',
  aircraft: '',
  status: 'scheduled' as FlightStatus,
  price: '',
  seats_available: '',
}

function toLocalInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function Flights() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Flight | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('flights').select('*').order('departure_time', { ascending: true })
    if (!error && data) setFlights(data as Flight[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return flights
    return flights.filter((f) =>
      [f.flight_number, f.origin, f.destination, f.aircraft].some((v) => v.toLowerCase().includes(q)),
    )
  }, [flights, query])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setError(null)
    setDrawerOpen(true)
  }

  function openEdit(f: Flight) {
    setEditing(f)
    setForm({
      flight_number: f.flight_number,
      origin: f.origin,
      destination: f.destination,
      departure_time: toLocalInput(f.departure_time),
      arrival_time: toLocalInput(f.arrival_time),
      aircraft: f.aircraft,
      status: f.status,
      price: String(f.price),
      seats_available: String(f.seats_available),
    })
    setError(null)
    setDrawerOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      flight_number: form.flight_number.trim(),
      origin: form.origin.trim().toUpperCase(),
      destination: form.destination.trim().toUpperCase(),
      departure_time: new Date(form.departure_time).toISOString(),
      arrival_time: new Date(form.arrival_time).toISOString(),
      aircraft: form.aircraft.trim(),
      status: form.status,
      price: Number(form.price),
      seats_available: Number(form.seats_available),
    }

    const { error } = editing
      ? await supabase.from('flights').update(payload).eq('id', editing.id)
      : await supabase.from('flights').insert(payload)

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setDrawerOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this flight? Linked orders will also be removed.')) return
    await supabase.from('flights').delete().eq('id', id)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Flights</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {flights.length} scheduled routes
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} weight="bold" /> New flight
        </Button>
      </div>

      <div className="relative max-w-xs">
        <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--text-tertiary)" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search flight, route, aircraft…"
          className="w-full pl-8"
        />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={query ? 'No flights match your search' : 'No flights yet'}
            hint={query ? 'Try a different flight number, route, or aircraft.' : 'Add your first scheduled flight to get started.'}
            action={!query && <Button onClick={openNew}>Add flight</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {['Flight', 'Route', 'Departure', 'Aircraft', 'Status', 'Price', 'Seats', ''].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-medium" style={{ color: 'var(--text-tertiary)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 font-mono font-medium">{f.flight_number}</td>
                    <td className="px-4 py-3">
                      {f.origin} <span style={{ color: 'var(--text-tertiary)' }}>&rarr;</span> {f.destination}
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(f.departure_time).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {f.aircraft}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[f.status]}>{f.status}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">${f.price.toLocaleString()}</td>
                    <td className="px-4 py-3 tabular-nums">{f.seats_available}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(f)}
                          className="rounded-[6px] p-1.5"
                          style={{ color: 'var(--text-secondary)' }}
                          aria-label="Edit flight"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="rounded-[6px] p-1.5"
                          style={{ color: 'var(--danger)' }}
                          aria-label="Delete flight"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit flight' : 'New flight'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Flight number">
            <Input required value={form.flight_number} onChange={(e) => setForm({ ...form, flight_number: e.target.value })} placeholder="SK 204" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Origin (IATA)">
              <Input required maxLength={4} value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="TLV" />
            </Field>
            <Field label="Destination (IATA)">
              <Input required maxLength={4} value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="JFK" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Departure">
              <Input required type="datetime-local" value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })} />
            </Field>
            <Field label="Arrival">
              <Input required type="datetime-local" value={form.arrival_time} onChange={(e) => setForm({ ...form, arrival_time: e.target.value })} />
            </Field>
          </div>
          <Field label="Aircraft">
            <Input required value={form.aircraft} onChange={(e) => setForm({ ...form, aircraft: e.target.value })} placeholder="Boeing 787-9" />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FlightStatus })}>
              {(['scheduled', 'boarding', 'departed', 'landed', 'delayed', 'cancelled'] as FlightStatus[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (USD)">
              <Input required type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Seats available">
              <Input required type="number" min={0} value={form.seats_available} onChange={(e) => setForm({ ...form, seats_available: e.target.value })} />
            </Field>
          </div>

          {error && (
            <p className="text-[13px]" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <div className="mt-2 flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create flight'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}

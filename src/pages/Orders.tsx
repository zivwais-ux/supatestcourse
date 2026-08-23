import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MagnifyingGlass, Pencil, Plus, Trash } from '@phosphor-icons/react'
import { supabase } from '../lib/supabase'
import type { Customer, Flight, OrderStatus, OrderWithRelations, SeatClass } from '../lib/types'
import { Badge, Button, Card, Drawer, EmptyState, Field, Input, Select, Skeleton } from '../components/ui'

const STATUS_TONE: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'accent'> = {
  confirmed: 'accent',
  pending: 'warning',
  cancelled: 'danger',
  completed: 'success',
}

const emptyForm = {
  customer_id: '',
  flight_id: '',
  seat_class: 'economy' as SeatClass,
  seat_number: '',
  status: 'confirmed' as OrderStatus,
  total_price: '',
}

export function Orders() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<OrderWithRelations | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const [ordersRes, customersRes, flightsRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*, customer:customers(id, full_name, email), flight:flights(id, flight_number, origin, destination, departure_time)')
        .order('created_at', { ascending: false }),
      supabase.from('customers').select('*').order('full_name'),
      supabase.from('flights').select('*').order('departure_time'),
    ])
    if (!ordersRes.error && ordersRes.data) setOrders(ordersRes.data as unknown as OrderWithRelations[])
    if (!customersRes.error && customersRes.data) setCustomers(customersRes.data as Customer[])
    if (!flightsRes.error && flightsRes.data) setFlights(flightsRes.data as Flight[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) =>
      [o.customer?.full_name ?? '', o.flight?.flight_number ?? '', o.seat_number ?? ''].some((v) => v.toLowerCase().includes(q)),
    )
  }, [orders, query])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setError(null)
    setDrawerOpen(true)
  }

  function openEdit(o: OrderWithRelations) {
    setEditing(o)
    setForm({
      customer_id: o.customer_id,
      flight_id: o.flight_id,
      seat_class: o.seat_class,
      seat_number: o.seat_number ?? '',
      status: o.status,
      total_price: String(o.total_price),
    })
    setError(null)
    setDrawerOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      customer_id: form.customer_id,
      flight_id: form.flight_id,
      seat_class: form.seat_class,
      seat_number: form.seat_number.trim() || null,
      status: form.status,
      total_price: Number(form.total_price),
    }

    const { error } = editing
      ? await supabase.from('orders').update(payload).eq('id', editing.id)
      : await supabase.from('orders').insert(payload)

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
    if (!confirm('Delete this order?')) return
    await supabase.from('orders').delete().eq('id', id)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {orders.length} bookings
          </p>
        </div>
        <Button onClick={openNew} disabled={customers.length === 0 || flights.length === 0}>
          <Plus size={16} weight="bold" /> New order
        </Button>
      </div>

      <div className="relative max-w-xs">
        <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--text-tertiary)" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customer, flight, seat…" className="w-full pl-8" />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : customers.length === 0 || flights.length === 0 ? (
          <EmptyState title="Add a customer and a flight first" hint="Orders link an existing customer to an existing flight." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={query ? 'No orders match your search' : 'No orders yet'}
            hint={query ? 'Try a different customer, flight, or seat.' : 'Book your first order to get started.'}
            action={!query && <Button onClick={openNew}>Add order</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {['Customer', 'Flight', 'Class', 'Seat', 'Status', 'Total', ''].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-medium" style={{ color: 'var(--text-tertiary)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customer?.full_name ?? 'Unknown'}</p>
                      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        {o.customer?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono font-medium">{o.flight?.flight_number ?? '—'}</p>
                      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        {o.flight ? `${o.flight.origin} → ${o.flight.destination}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 capitalize" style={{ color: 'var(--text-secondary)' }}>
                      {o.seat_class.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {o.seat_number || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">${o.total_price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(o)} className="rounded-[6px] p-1.5" style={{ color: 'var(--text-secondary)' }} aria-label="Edit order">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(o.id)} className="rounded-[6px] p-1.5" style={{ color: 'var(--danger)' }} aria-label="Delete order">
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

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit order' : 'New order'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Customer">
            <Select required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Flight">
            <Select required value={form.flight_id} onChange={(e) => setForm({ ...form, flight_id: e.target.value })}>
              <option value="" disabled>
                Select a flight
              </option>
              {flights.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.flight_number} · {f.origin} → {f.destination}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Seat class">
              <Select value={form.seat_class} onChange={(e) => setForm({ ...form, seat_class: e.target.value as SeatClass })}>
                {(['economy', 'premium_economy', 'business', 'first'] as SeatClass[]).map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Seat number">
              <Input value={form.seat_number} onChange={(e) => setForm({ ...form, seat_number: e.target.value })} placeholder="14C" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}>
                {(['confirmed', 'pending', 'cancelled', 'completed'] as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Total price (USD)">
              <Input required type="number" min={0} step="0.01" value={form.total_price} onChange={(e) => setForm({ ...form, total_price: e.target.value })} />
            </Field>
          </div>

          {error && (
            <p className="text-[13px]" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <div className="mt-2 flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create order'}
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

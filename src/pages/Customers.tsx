import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MagnifyingGlass, Pencil, Plus, Trash } from '@phosphor-icons/react'
import { supabase } from '../lib/supabase'
import type { Customer } from '../lib/types'
import { Button, Card, Drawer, EmptyState, Field, Input, Skeleton } from '../components/ui'

const emptyForm = { full_name: '', email: '', phone: '', passport_number: '', nationality: '' }

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
    if (!error && data) setCustomers(data as Customer[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => [c.full_name, c.email, c.nationality ?? ''].some((v) => v.toLowerCase().includes(q)))
  }, [customers, query])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setError(null)
    setDrawerOpen(true)
  }

  function openEdit(c: Customer) {
    setEditing(c)
    setForm({
      full_name: c.full_name,
      email: c.email,
      phone: c.phone ?? '',
      passport_number: c.passport_number ?? '',
      nationality: c.nationality ?? '',
    })
    setError(null)
    setDrawerOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      passport_number: form.passport_number.trim() || null,
      nationality: form.nationality.trim() || null,
    }

    const { error } = editing
      ? await supabase.from('customers').update(payload).eq('id', editing.id)
      : await supabase.from('customers').insert(payload)

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
    if (!confirm('Delete this customer? Linked orders will also be removed.')) return
    await supabase.from('customers').delete().eq('id', id)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {customers.length} people on file
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} weight="bold" /> New customer
        </Button>
      </div>

      <div className="relative max-w-xs">
        <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--text-tertiary)" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, nationality…" className="w-full pl-8" />
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
            title={query ? 'No customers match your search' : 'No customers yet'}
            hint={query ? 'Try a different name, email, or nationality.' : 'Add your first customer record to get started.'}
            action={!query && <Button onClick={openNew}>Add customer</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {['Customer', 'Phone', 'Passport', 'Nationality', ''].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-medium" style={{ color: 'var(--text-tertiary)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                        >
                          {initials(c.full_name) || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{c.full_name}</p>
                          <p className="truncate text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {c.phone || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {c.passport_number || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {c.nationality || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="rounded-[6px] p-1.5" style={{ color: 'var(--text-secondary)' }} aria-label="Edit customer">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="rounded-[6px] p-1.5" style={{ color: 'var(--danger)' }} aria-label="Delete customer">
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

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit customer' : 'New customer'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full name">
            <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Noa Bar-Lev" />
          </Field>
          <Field label="Email">
            <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="noa@example.com" />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+972 52 123 4567" />
          </Field>
          <Field label="Passport number">
            <Input value={form.passport_number} onChange={(e) => setForm({ ...form, passport_number: e.target.value })} placeholder="18273645" />
          </Field>
          <Field label="Nationality">
            <Input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} placeholder="Israeli" />
          </Field>

          {error && (
            <p className="text-[13px]" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <div className="mt-2 flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create customer'}
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

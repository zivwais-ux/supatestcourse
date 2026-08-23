import { useEffect, useState } from 'react'
import { Airplane, Ticket, TrendUp, Users } from '@phosphor-icons/react'
import { supabase } from '../lib/supabase'
import type { OrderWithRelations } from '../lib/types'
import { Badge, Card, EmptyState, Skeleton } from '../components/ui'

interface Stats {
  flightCount: number
  customerCount: number
  orderCount: number
  revenue: number
}

const STATUS_TONE: Record<string, 'neutral' | 'success' | 'warning' | 'danger' | 'accent'> = {
  confirmed: 'accent',
  pending: 'warning',
  cancelled: 'danger',
  completed: 'success',
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<OrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [flights, customers, orders, recent] = await Promise.all([
        supabase.from('flights').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total_price'),
        supabase
          .from('orders')
          .select('*, customer:customers(id, full_name, email), flight:flights(id, flight_number, origin, destination, departure_time)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const revenue = (orders.data ?? []).reduce((sum, o) => sum + Number(o.total_price), 0)

      setStats({
        flightCount: flights.count ?? 0,
        customerCount: customers.count ?? 0,
        orderCount: orders.data?.length ?? 0,
        revenue,
      })
      setRecentOrders((recent.data ?? []) as unknown as OrderWithRelations[])
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Active flights', value: stats?.flightCount, icon: Airplane },
    { label: 'Customers', value: stats?.customerCount, icon: Users },
    { label: 'Orders', value: stats?.orderCount, icon: Ticket },
    { label: 'Revenue', value: stats ? `$${stats.revenue.toLocaleString()}` : undefined, icon: TrendUp },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          Operations overview
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {c.label}
              </span>
              <c.icon size={16} style={{ color: 'var(--accent)' }} />
            </div>
            {loading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-semibold tabular-nums">{c.value}</p>}
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b px-5 py-3.5" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-[14px] font-semibold">Recent orders</h2>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <EmptyState title="No orders yet" hint="Bookings will show up here as soon as they come in." />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3.5 text-[13.5px]">
                <div>
                  <p className="font-medium">{o.customer?.full_name ?? 'Unknown'}</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {o.flight?.flight_number} · {o.flight?.origin} → {o.flight?.destination}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                  <span className="font-mono tabular-nums">${o.total_price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/**
 * In-memory stand-in for the Supabase client, used when no Supabase project is
 * configured (see `supabase.ts`). It implements only the slice of the
 * PostgREST + auth API this app actually calls, so the CRM can be demoed with
 * seed data. Writes persist to localStorage for the current browser only.
 */
import { demoCustomers, demoFlights, demoOrders } from './demoData'
import type { Customer, Flight, Order } from './types'

type Row = Record<string, unknown> & { id: string; created_at: string; updated_at: string }
type Tables = { flights: Flight[]; customers: Customer[]; orders: Order[] }
type TableName = keyof Tables

const STORAGE_KEY = 'skyline-crm-demo-v1'

function seed(): Tables {
  return { flights: [...demoFlights], customers: [...demoCustomers], orders: [...demoOrders] }
}

function loadDb(): Tables {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Tables
  } catch {
    // Private mode or blocked storage: fall back to a fresh in-memory copy.
  }
  return seed()
}

const db = loadDb()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Non-fatal: the session simply won't survive a reload.
  }
}

export function resetDemoData() {
  const fresh = seed()
  db.flights = fresh.flights
  db.customers = fresh.customers
  db.orders = fresh.orders
  persist()
}

function nextId(prefix: string, rows: { id: string }[]) {
  return `${prefix}${rows.length + 1}-${Math.random().toString(36).slice(2, 7)}`
}

interface Result {
  data: unknown
  error: { message: string } | null
  count: number | null
}

class QueryBuilder implements PromiseLike<Result> {
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private columns = '*'
  private head = false
  private wantCount = false
  private payload: Record<string, unknown> = {}
  private filters: [string, unknown][] = []
  private sort: { column: string; ascending: boolean } | null = null
  private max: number | null = null

  private table: TableName

  constructor(table: TableName) {
    this.table = table
  }

  select(columns = '*', opts?: { count?: string; head?: boolean }) {
    if (this.action === 'select') this.columns = columns
    this.wantCount = Boolean(opts?.count)
    this.head = Boolean(opts?.head)
    return this
  }

  insert(payload: Record<string, unknown>) {
    this.action = 'insert'
    this.payload = payload
    return this
  }

  update(payload: Record<string, unknown>) {
    this.action = 'update'
    this.payload = payload
    return this
  }

  delete() {
    this.action = 'delete'
    return this
  }

  eq(column: string, value: unknown) {
    this.filters.push([column, value])
    return this
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.sort = { column, ascending: opts?.ascending !== false }
    return this
  }

  limit(n: number) {
    this.max = n
    return this
  }

  private rows() {
    return db[this.table] as unknown as Row[]
  }

  private matches(row: Row) {
    return this.filters.every(([column, value]) => row[column] === value)
  }

  private embed(order: Row) {
    if (!this.columns.includes('customers(')) return order
    const customer = db.customers.find((c) => c.id === order.customer_id)
    const flight = db.flights.find((f) => f.id === order.flight_id)
    return {
      ...order,
      customer: customer ? { id: customer.id, full_name: customer.full_name, email: customer.email } : null,
      flight: flight
        ? {
            id: flight.id,
            flight_number: flight.flight_number,
            origin: flight.origin,
            destination: flight.destination,
            departure_time: flight.departure_time,
          }
        : null,
    }
  }

  private run(): Result {
    const stamp = new Date().toISOString()
    const rows = this.rows()

    if (this.action === 'insert') {
      const row = {
        id: nextId(this.table[0], rows),
        ...this.payload,
        created_at: stamp,
        updated_at: stamp,
      } as Row
      rows.unshift(row)
      persist()
      return { data: [row], error: null, count: null }
    }

    if (this.action === 'update') {
      rows.forEach((row, i) => {
        if (this.matches(row)) rows[i] = { ...row, ...this.payload, updated_at: stamp } as Row
      })
      persist()
      return { data: null, error: null, count: null }
    }

    if (this.action === 'delete') {
      const removed = rows.filter((row) => this.matches(row)).map((row) => row.id)
      const kept = rows.filter((row) => !this.matches(row))
      rows.length = 0
      rows.push(...kept)
      // Mirror the schema's ON DELETE CASCADE from orders to flights/customers.
      if (this.table === 'flights' || this.table === 'customers') {
        const key = this.table === 'flights' ? 'flight_id' : 'customer_id'
        db.orders = db.orders.filter((o) => !removed.includes(o[key as 'flight_id' | 'customer_id']))
      }
      persist()
      return { data: null, error: null, count: null }
    }

    let result = rows.filter((row) => this.matches(row))

    if (this.sort) {
      const { column, ascending } = this.sort
      result = [...result].sort((a, b) => {
        const x = a[column] as string | number
        const y = b[column] as string | number
        if (x === y) return 0
        return (x < y ? -1 : 1) * (ascending ? 1 : -1)
      })
    }

    const count = result.length
    if (this.head) return { data: null, error: null, count }
    if (this.max !== null) result = result.slice(0, this.max)
    if (this.table === 'orders') result = result.map((row) => this.embed(row) as Row)

    return { data: result, error: null, count: this.wantCount ? count : null }
  }

  then<A = Result, B = never>(
    onfulfilled?: ((value: Result) => A | PromiseLike<A>) | null,
    onrejected?: ((reason: unknown) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return Promise.resolve(this.run()).then(onfulfilled, onrejected)
  }
}

const DEMO_USER = { id: 'demo-user', email: 'demo@skyline.air' }
const DEMO_SESSION = { user: DEMO_USER, access_token: 'demo', token_type: 'bearer', expires_in: 3600 }

type Listener = (event: string, session: unknown) => void
const listeners = new Set<Listener>()
let session: unknown = DEMO_SESSION

export const demoClient = {
  from: (table: TableName) => new QueryBuilder(table),
  auth: {
    async getSession() {
      return { data: { session }, error: null }
    },
    async signInWithPassword() {
      session = DEMO_SESSION
      listeners.forEach((fn) => fn('SIGNED_IN', session))
      return { data: { session }, error: null }
    },
    async signUp() {
      session = DEMO_SESSION
      listeners.forEach((fn) => fn('SIGNED_IN', session))
      return { data: { session }, error: null }
    },
    async signOut() {
      session = null
      listeners.forEach((fn) => fn('SIGNED_OUT', null))
      return { error: null }
    },
    onAuthStateChange(fn: Listener) {
      listeners.add(fn)
      return { data: { subscription: { unsubscribe: () => listeners.delete(fn) } } }
    },
  },
}

-- Airline CRM schema: flights, customers, orders
-- All tables are behind RLS; only authenticated staff users may read/write.

create table public.flights (
  id uuid primary key default gen_random_uuid(),
  flight_number text not null unique,
  origin text not null,
  destination text not null,
  departure_time timestamptz not null,
  arrival_time timestamptz not null,
  aircraft text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'boarding', 'departed', 'landed', 'delayed', 'cancelled')),
  price numeric(10, 2) not null check (price >= 0),
  seats_available integer not null default 0 check (seats_available >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint arrival_after_departure check (arrival_time > departure_time)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  passport_number text,
  nationality text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  flight_id uuid not null references public.flights (id) on delete cascade,
  seat_class text not null default 'economy' check (seat_class in ('economy', 'premium_economy', 'business', 'first')),
  seat_number text,
  status text not null default 'confirmed' check (status in ('confirmed', 'pending', 'cancelled', 'completed')),
  total_price numeric(10, 2) not null check (total_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_flight_id_idx on public.orders (flight_id);
create index flights_departure_time_idx on public.flights (departure_time);
create index customers_email_idx on public.customers (email);

-- updated_at maintenance
create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger flights_set_updated_at
  before update on public.flights
  for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- RLS: internal CRM, any authenticated staff user has full access.
alter table public.flights enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;

create policy "Authenticated staff can read flights"
  on public.flights for select
  to authenticated
  using (true);

create policy "Authenticated staff can write flights"
  on public.flights for insert
  to authenticated
  with check (true);

create policy "Authenticated staff can update flights"
  on public.flights for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated staff can delete flights"
  on public.flights for delete
  to authenticated
  using (true);

create policy "Authenticated staff can read customers"
  on public.customers for select
  to authenticated
  using (true);

create policy "Authenticated staff can write customers"
  on public.customers for insert
  to authenticated
  with check (true);

create policy "Authenticated staff can update customers"
  on public.customers for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated staff can delete customers"
  on public.customers for delete
  to authenticated
  using (true);

create policy "Authenticated staff can read orders"
  on public.orders for select
  to authenticated
  using (true);

create policy "Authenticated staff can write orders"
  on public.orders for insert
  to authenticated
  with check (true);

create policy "Authenticated staff can update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated staff can delete orders"
  on public.orders for delete
  to authenticated
  using (true);

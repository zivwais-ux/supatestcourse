-- Fix: the previous migration granted every authenticated user (i.e. anyone
-- who self-signs up in the app) full read/write access to flights, customers,
-- and orders. Since customer records hold PII (email, phone, passport
-- number, nationality) and signup is open, that amounted to public exposure
-- of sensitive data and broken access control.
--
-- This introduces an explicit staff allow-list. Having an auth account is no
-- longer sufficient; the account's email must also be present in
-- public.staff. New signups get an account but zero data access until an
-- admin inserts their email here.

create table public.staff (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Intentionally no RLS policies on public.staff: with RLS enabled and no
-- policies, anon/authenticated clients get zero access (including to see
-- who else is staff). Membership is managed by an admin via SQL/dashboard.
alter table public.staff enable row level security;

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff s where s.email = (select auth.jwt() ->> 'email')
  );
$$;

drop policy "Authenticated staff can read flights" on public.flights;
drop policy "Authenticated staff can write flights" on public.flights;
drop policy "Authenticated staff can update flights" on public.flights;
drop policy "Authenticated staff can delete flights" on public.flights;

create policy "Staff can read flights" on public.flights for select to authenticated using (public.is_staff());
create policy "Staff can write flights" on public.flights for insert to authenticated with check (public.is_staff());
create policy "Staff can update flights" on public.flights for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete flights" on public.flights for delete to authenticated using (public.is_staff());

drop policy "Authenticated staff can read customers" on public.customers;
drop policy "Authenticated staff can write customers" on public.customers;
drop policy "Authenticated staff can update customers" on public.customers;
drop policy "Authenticated staff can delete customers" on public.customers;

create policy "Staff can read customers" on public.customers for select to authenticated using (public.is_staff());
create policy "Staff can write customers" on public.customers for insert to authenticated with check (public.is_staff());
create policy "Staff can update customers" on public.customers for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete customers" on public.customers for delete to authenticated using (public.is_staff());

drop policy "Authenticated staff can read orders" on public.orders;
drop policy "Authenticated staff can write orders" on public.orders;
drop policy "Authenticated staff can update orders" on public.orders;
drop policy "Authenticated staff can delete orders" on public.orders;

create policy "Staff can read orders" on public.orders for select to authenticated using (public.is_staff());
create policy "Staff can write orders" on public.orders for insert to authenticated with check (public.is_staff());
create policy "Staff can update orders" on public.orders for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete orders" on public.orders for delete to authenticated using (public.is_staff());

-- Seed the project owner as the first staff member.
insert into public.staff (email) values ('zivwais@gmail.com');

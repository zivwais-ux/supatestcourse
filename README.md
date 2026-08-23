# Skyline CRM

An airline CRM built on React, Vite, Tailwind, and Supabase. Manage flights, customers, and orders behind a staff login.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Supabase (Postgres, Auth, RLS)
- React Router
- Phosphor Icons

## Data model

- **flights** — flight number, route, schedule, aircraft, status, price, seat inventory
- **customers** — contact and travel document details
- **orders** — links a customer to a flight with seat class, seat number, status, and price

All three tables have row-level security enabled: only authenticated staff users can read or write. See `supabase/migrations/` for the full schema.

## Local development

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL and publishable key
npm run dev
```

The app requires a Supabase project with the migration in `supabase/migrations/` applied:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Sign-up is open to any email (confirmation required) — the first account you create is your staff login.

## Build

```bash
npm run build
```

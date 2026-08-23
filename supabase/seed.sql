-- Demo data for local development (`supabase db reset` loads this file).
-- Safe to re-run: every insert is keyed on a deterministic id.

insert into public.flights (id, flight_number, origin, destination, departure_time, arrival_time, aircraft, status, price, seats_available)
values
  ('11111111-1111-4111-8111-000000000001', 'SK101', 'TLV', 'JFK', now() + interval '6 hours',  now() + interval '18 hours 30 minutes', 'Boeing 787-9',      'scheduled',  890, 42),
  ('11111111-1111-4111-8111-000000000002', 'SK204', 'TLV', 'LHR', now() + interval '2 hours',  now() + interval '7 hours',              'Airbus A320neo',    'boarding',   320, 8),
  ('11111111-1111-4111-8111-000000000003', 'SK318', 'CDG', 'TLV', now() + interval '9 hours',  now() + interval '13 hours 30 minutes',  'Airbus A321',       'scheduled',  275, 61),
  ('11111111-1111-4111-8111-000000000004', 'SK422', 'TLV', 'DXB', now() - interval '1 hour',   now() + interval '2 hours 12 minutes',   'Boeing 737 MAX 8',  'departed',   210, 0),
  ('11111111-1111-4111-8111-000000000005', 'SK530', 'JFK', 'TLV', now() + interval '26 hours', now() + interval '36 hours 30 minutes',  'Boeing 787-9',      'scheduled',  940, 118),
  ('11111111-1111-4111-8111-000000000006', 'SK611', 'TLV', 'ATH', now() + interval '4 hours',  now() + interval '6 hours 6 minutes',    'Airbus A320neo',    'delayed',    165, 23),
  ('11111111-1111-4111-8111-000000000007', 'SK725', 'BCN', 'TLV', now() + interval '31 hours', now() + interval '35 hours 24 minutes',  'Airbus A321',       'scheduled',  240, 74),
  ('11111111-1111-4111-8111-000000000008', 'SK803', 'TLV', 'BKK', now() + interval '50 hours', now() + interval '60 hours 30 minutes',  'Boeing 777-300ER',  'scheduled', 1120, 96),
  ('11111111-1111-4111-8111-000000000009', 'SK909', 'FCO', 'TLV', now() - interval '8 hours',  now() - interval '5 hours 42 minutes',   'Airbus A320neo',    'landed',     190, 0),
  ('11111111-1111-4111-8111-000000000010', 'SK044', 'TLV', 'BER', now() + interval '12 hours', now() + interval '16 hours 24 minutes',  'Airbus A321',       'cancelled',  205, 0)
on conflict (id) do nothing;

insert into public.customers (id, full_name, email, phone, passport_number, nationality)
values
  ('22222222-2222-4222-8222-000000000001', 'Noa Bar-Lev',      'noa.barlev@example.com',      '+972-52-441-0192', 'IL8842190', 'Israel'),
  ('22222222-2222-4222-8222-000000000002', 'Daniel Weiss',     'daniel.weiss@example.com',    '+972-54-337-8821', 'IL7710482', 'Israel'),
  ('22222222-2222-4222-8222-000000000003', 'Maya Cohen',       'maya.cohen@example.com',      '+972-50-882-4417', 'IL9028833', 'Israel'),
  ('22222222-2222-4222-8222-000000000004', 'James Whitfield',  'j.whitfield@example.com',     '+44-7700-900412',  'GB4471902', 'United Kingdom'),
  ('22222222-2222-4222-8222-000000000005', 'Élise Moreau',     'elise.moreau@example.com',    '+33-6-12-88-04-51','FR2093487', 'France'),
  ('22222222-2222-4222-8222-000000000006', 'Tomás Ferreira',   'tomas.ferreira@example.com',  '+351-912-448-201', 'PT5518720', 'Portugal'),
  ('22222222-2222-4222-8222-000000000007', 'Sofia Rossi',      'sofia.rossi@example.com',     '+39-333-902-1174', 'IT8830142', 'Italy'),
  ('22222222-2222-4222-8222-000000000008', 'Amir Hassan',      'amir.hassan@example.com',     '+971-50-771-3320', 'AE1129084', 'UAE'),
  ('22222222-2222-4222-8222-000000000009', 'Hannah Klein',     'hannah.klein@example.com',    '+49-151-2233-8890','DE7719023', 'Germany'),
  ('22222222-2222-4222-8222-000000000010', 'Yuki Tanaka',      'yuki.tanaka@example.com',     '+81-90-8812-4471', 'JP3390117', 'Japan')
on conflict (id) do nothing;

insert into public.orders (id, customer_id, flight_id, seat_class, seat_number, status, total_price, created_at)
values
  ('33333333-3333-4333-8333-000000000001', '22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-000000000001', 'business',        '3A',  'confirmed', 2140, now() - interval '10 hours'),
  ('33333333-3333-4333-8333-000000000002', '22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-000000000001', 'economy',         '27C', 'confirmed',  890, now() - interval '1 day'),
  ('33333333-3333-4333-8333-000000000003', '22222222-2222-4222-8222-000000000004', '11111111-1111-4111-8111-000000000002', 'premium_economy', '11F', 'completed',  540, now() - interval '2 days'),
  ('33333333-3333-4333-8333-000000000004', '22222222-2222-4222-8222-000000000005', '11111111-1111-4111-8111-000000000003', 'economy',         '19B', 'confirmed',  275, now() - interval '3 days'),
  ('33333333-3333-4333-8333-000000000005', '22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-000000000004', 'first',           '1A',  'completed', 1980, now() - interval '5 days'),
  ('33333333-3333-4333-8333-000000000006', '22222222-2222-4222-8222-000000000006', '11111111-1111-4111-8111-000000000005', 'business',        '4D',  'pending',   2260, now() - interval '21 hours'),
  ('33333333-3333-4333-8333-000000000007', '22222222-2222-4222-8222-000000000007', '11111111-1111-4111-8111-000000000005', 'economy',         '31A', 'confirmed',  940, now() - interval '1 day'),
  ('33333333-3333-4333-8333-000000000008', '22222222-2222-4222-8222-000000000008', '11111111-1111-4111-8111-000000000006', 'economy',         '8C',  'cancelled',  165, now() - interval '4 days'),
  ('33333333-3333-4333-8333-000000000009', '22222222-2222-4222-8222-000000000009', '11111111-1111-4111-8111-000000000007', 'premium_economy', '14A', 'confirmed',  410, now() - interval '3 days'),
  ('33333333-3333-4333-8333-000000000010', '22222222-2222-4222-8222-000000000010', '11111111-1111-4111-8111-000000000008', 'business',        '2F',  'confirmed', 2890, now() - interval '5 hours'),
  ('33333333-3333-4333-8333-000000000011', '22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-000000000008', 'economy',         '44B', 'pending',   1120, now() - interval '6 days'),
  ('33333333-3333-4333-8333-000000000012', '22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-000000000009', 'economy',         '22D', 'completed',  190, now() - interval '9 days'),
  ('33333333-3333-4333-8333-000000000013', '22222222-2222-4222-8222-000000000005', '11111111-1111-4111-8111-000000000009', 'premium_economy', '9A',  'completed',  380, now() - interval '11 days'),
  ('33333333-3333-4333-8333-000000000014', '22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-000000000010', 'economy',         '17E', 'cancelled',  205, now() - interval '8 days')
on conflict (id) do nothing;

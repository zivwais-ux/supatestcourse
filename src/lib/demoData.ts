import type { Customer, Flight, Order } from './types'

const now = Date.now()
const HOUR = 3600_000
const DAY = 24 * HOUR

const at = (offsetHours: number) => new Date(now + offsetHours * HOUR).toISOString()
const ago = (days: number) => new Date(now - days * DAY).toISOString()

export const demoFlights: Flight[] = [
  ['SK101', 'TLV', 'JFK', 6, 18.5, 'Boeing 787-9', 'scheduled', 890, 42],
  ['SK204', 'TLV', 'LHR', 2, 7, 'Airbus A320neo', 'boarding', 320, 8],
  ['SK318', 'CDG', 'TLV', 9, 13.5, 'Airbus A321', 'scheduled', 275, 61],
  ['SK422', 'TLV', 'DXB', -1, 2.2, 'Boeing 737 MAX 8', 'departed', 210, 0],
  ['SK530', 'JFK', 'TLV', 26, 36.5, 'Boeing 787-9', 'scheduled', 940, 118],
  ['SK611', 'TLV', 'ATH', 4, 6.1, 'Airbus A320neo', 'delayed', 165, 23],
  ['SK725', 'BCN', 'TLV', 31, 35.4, 'Airbus A321', 'scheduled', 240, 74],
  ['SK803', 'TLV', 'BKK', 50, 60.5, 'Boeing 777-300ER', 'scheduled', 1120, 96],
  ['SK909', 'FCO', 'TLV', -8, -5.7, 'Airbus A320neo', 'landed', 190, 0],
  ['SK044', 'TLV', 'BER', 12, 16.4, 'Airbus A321', 'cancelled', 205, 0],
].map(([flight_number, origin, destination, dep, arr, aircraft, status, price, seats], i) => ({
  id: `f${i + 1}`,
  flight_number: flight_number as string,
  origin: origin as string,
  destination: destination as string,
  departure_time: at(dep as number),
  arrival_time: at(arr as number),
  aircraft: aircraft as string,
  status: status as Flight['status'],
  price: price as number,
  seats_available: seats as number,
  created_at: ago(30 - i),
  updated_at: ago(3),
}))

export const demoCustomers: Customer[] = [
  ['Noa Bar-Lev', 'noa.barlev@example.com', '+972-52-441-0192', 'IL8842190', 'Israel'],
  ['Daniel Weiss', 'daniel.weiss@example.com', '+972-54-337-8821', 'IL7710482', 'Israel'],
  ['Maya Cohen', 'maya.cohen@example.com', '+972-50-882-4417', 'IL9028833', 'Israel'],
  ['James Whitfield', 'j.whitfield@example.com', '+44-7700-900412', 'GB4471902', 'United Kingdom'],
  ['Élise Moreau', 'elise.moreau@example.com', '+33-6-12-88-04-51', 'FR2093487', 'France'],
  ['Tomás Ferreira', 'tomas.ferreira@example.com', '+351-912-448-201', 'PT5518720', 'Portugal'],
  ['Sofia Rossi', 'sofia.rossi@example.com', '+39-333-902-1174', 'IT8830142', 'Italy'],
  ['Amir Hassan', 'amir.hassan@example.com', '+971-50-771-3320', 'AE1129084', 'UAE'],
  ['Hannah Klein', 'hannah.klein@example.com', '+49-151-2233-8890', 'DE7719023', 'Germany'],
  ['Yuki Tanaka', 'yuki.tanaka@example.com', '+81-90-8812-4471', 'JP3390117', 'Japan'],
].map(([full_name, email, phone, passport_number, nationality], i) => ({
  id: `c${i + 1}`,
  full_name,
  email,
  phone,
  passport_number,
  nationality,
  created_at: ago(60 - i * 4),
  updated_at: ago(2),
}))

export const demoOrders: Order[] = [
  ['c1', 'f1', 'business', '3A', 'confirmed', 2140, 0.4],
  ['c2', 'f1', 'economy', '27C', 'confirmed', 890, 1.2],
  ['c4', 'f2', 'premium_economy', '11F', 'completed', 540, 2.1],
  ['c5', 'f3', 'economy', '19B', 'confirmed', 275, 3.4],
  ['c3', 'f4', 'first', '1A', 'completed', 1980, 5.5],
  ['c6', 'f5', 'business', '4D', 'pending', 2260, 0.9],
  ['c7', 'f5', 'economy', '31A', 'confirmed', 940, 1.7],
  ['c8', 'f6', 'economy', '8C', 'cancelled', 165, 4.2],
  ['c9', 'f7', 'premium_economy', '14A', 'confirmed', 410, 2.8],
  ['c10', 'f8', 'business', '2F', 'confirmed', 2890, 0.2],
  ['c1', 'f8', 'economy', '44B', 'pending', 1120, 6.1],
  ['c3', 'f9', 'economy', '22D', 'completed', 190, 9.3],
  ['c5', 'f9', 'premium_economy', '9A', 'completed', 380, 11.5],
  ['c2', 'f10', 'economy', '17E', 'cancelled', 205, 7.8],
].map(([customer_id, flight_id, seat_class, seat_number, status, total_price, daysAgo], i) => ({
  id: `o${i + 1}`,
  customer_id: customer_id as string,
  flight_id: flight_id as string,
  seat_class: seat_class as Order['seat_class'],
  seat_number: seat_number as string,
  status: status as Order['status'],
  total_price: total_price as number,
  created_at: ago(daysAgo as number),
  updated_at: ago(daysAgo as number),
}))

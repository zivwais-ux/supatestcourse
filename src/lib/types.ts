export type FlightStatus = 'scheduled' | 'boarding' | 'departed' | 'landed' | 'delayed' | 'cancelled'
export type SeatClass = 'economy' | 'premium_economy' | 'business' | 'first'
export type OrderStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

export interface Flight {
  id: string
  flight_number: string
  origin: string
  destination: string
  departure_time: string
  arrival_time: string
  aircraft: string
  status: FlightStatus
  price: number
  seats_available: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  full_name: string
  email: string
  phone: string | null
  passport_number: string | null
  nationality: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  flight_id: string
  seat_class: SeatClass
  seat_number: string | null
  status: OrderStatus
  total_price: number
  created_at: string
  updated_at: string
}

export interface OrderWithRelations extends Order {
  customer: Pick<Customer, 'id' | 'full_name' | 'email'> | null
  flight: Pick<Flight, 'id' | 'flight_number' | 'origin' | 'destination' | 'departure_time'> | null
}

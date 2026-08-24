export type ClientType = 'קונה' | 'מוכר' | 'שוכר' | 'משכיר' | 'משקיע'
export type ClientStatus = 'ליד חדש' | 'בטיפול' | 'סיור מתוכנן' | 'במשא ומתן' | 'נסגר' | 'לא רלוונטי'
export type ListingStatus = 'למכירה' | 'בבלעדיות' | 'להשכרה' | 'במשא ומתן' | 'נמכר' | 'הושכר'

export interface Client {
  id: string
  full_name: string
  phone: string
  email: string | null
  client_type: ClientType
  status: ClientStatus
  budget_min: number | null
  budget_max: number | null
  preferred_city: string | null
  preferred_rooms: number | null
  agent: string
  source: string | null
  notes: string | null
  created_at: string
}

export interface Listing {
  id: string
  title: string
  city: string
  neighborhood: string | null
  street: string | null
  property_type: string
  rooms: number | null
  size_sqm: number | null
  lot_sqm: number | null
  floor: number | null
  price: number
  status: ListingStatus
  agent: string
  has_parking: boolean
  has_balcony: boolean
  has_elevator: boolean
  description: string | null
  listed_at: string
  created_at: string
}

export interface CityMonthlySale {
  id: string
  month: string
  city: string
  houses_sold: number
  avg_price: number
  total_volume: number
  is_top_city: boolean
  created_at: string
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { demoClient } from './demoClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/**
 * True when no Supabase project is configured. The app then runs off seed data
 * held in the browser so the UI can be explored without a backend.
 */
export const isDemo = !supabaseUrl || !supabaseKey

export const supabase = (
  isDemo ? demoClient : createClient(supabaseUrl, supabaseKey)
) as unknown as SupabaseClient

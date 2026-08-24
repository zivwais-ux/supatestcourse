import { createClient } from '@supabase/supabase-js'

// מפתח publishable מיועד לצד הלקוח; הגישה מוגבלת בקריאה בלבד דרך RLS
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://cdnlrghysblhqpngeahd.supabase.co'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_TdF7khWH3_NBOXOHBgKAXQ_gmNijtxF'

export const supabase = createClient(supabaseUrl, supabaseKey)

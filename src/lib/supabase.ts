import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para browser - usa cookies para SSR
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

// Cliente para server-side con service role (NUNCA exponer al cliente)
export function createServerClient() {
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Cliente para Realtime subscriptions
export function getRealtimeClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
}

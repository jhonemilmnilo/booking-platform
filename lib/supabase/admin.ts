import { createClient } from "@supabase/supabase-js"

/**
 * Creates an administrative Supabase client using the Service Role Key.
 * This should ONLY be called in secure server-side environments (Server Actions, Route Handlers).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables.")
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

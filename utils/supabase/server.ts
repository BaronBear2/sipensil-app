// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}


export async function createAdminClient() {
  const cookieStore = await cookies()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    console.error("🚨 SUPABASE_SERVICE_ROLE_KEY is missing from environment variables");
  }

  // Pure Admin Client - No Cookies
  // We explicitly return empty cookies to prevent @supabase/ssr from trying to manage user sessions.
  // This ensures the client uses ONLY the Service Role Key and acts as 'service_role'.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll(cookiesToSet) {
          // Do nothing
        }
      },
      auth: {
        // Ensure autoRefreshToken is off, though usually Service Key implies this
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
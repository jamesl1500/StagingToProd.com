import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from './env'

/** Refreshes the learner's Supabase session cookie on every page request. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  if (!isSupabaseConfigured) return response

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // Do not put code between createServerClient and getClaims: it can log learners out at random.
  await supabase.auth.getClaims()

  return response
}

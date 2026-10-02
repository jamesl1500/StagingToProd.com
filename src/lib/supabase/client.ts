import { createBrowserClient } from '@supabase/ssr'

import { supabasePublishableKey, supabaseUrl } from './env'

/** Supabase client for Client Components (learner auth, progress updates). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey)
}

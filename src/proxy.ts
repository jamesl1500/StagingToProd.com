import type { NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Skip the Payload admin and API (they use Payload's own auth), Next internals and static files.
  matcher: ['/((?!admin|api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

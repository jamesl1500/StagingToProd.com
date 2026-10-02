import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthCard } from '@/components/AuthCard'
import { getLearner, safeNext } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Create account', robots: { index: false } }

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next)
  if (await getLearner()) redirect(next)
  return <AuthCard mode="signup" next={next} />
}

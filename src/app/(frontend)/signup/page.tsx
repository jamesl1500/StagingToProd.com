import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthCard } from '@/components/AuthCard'
import { firstParam, type SearchParams } from '@/lib/params'
import { getLearner, safeNext } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Create account', robots: { index: false } }

export default async function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const next = safeNext(firstParam((await searchParams).next))
  if (await getLearner()) redirect(next)
  return <AuthCard mode="signup" next={next} />
}

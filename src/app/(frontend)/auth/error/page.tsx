import type { Metadata } from 'next'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { firstParam, type SearchParams } from '@/lib/params'

export const metadata: Metadata = { title: 'Sign-in problem', robots: { index: false } }

const messages: Record<string, string> = {
  callback: 'That sign-in link is invalid or has expired. Links work once and last one hour.',
  confirm: 'We could not confirm that email link. It may have expired or already been used.',
  oauth: 'GitHub sign-in could not start. Try again, or use an email link instead.',
  config: 'Sign-in is not configured on this site yet.',
}

export default async function AuthErrorPage({ searchParams }: { searchParams: SearchParams }) {
  const reason = firstParam((await searchParams).reason)
  return (
    <Container>
      <PageHeader
        eyebrow="[err] auth"
        title="Sign-in failed"
        lead={messages[reason ?? ''] ?? 'Something went wrong while signing you in.'}
      >
        <Button href="/login">Try again</Button>
      </PageHeader>
    </Container>
  )
}

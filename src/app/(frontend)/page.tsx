import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-24">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        StagingToProd
      </p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Learn to code. Ship like a software engineer.
      </h1>
      <p className="text-lg text-muted-foreground">
        Lessons, courses and videos that take you from your first line of code to production.
        Courses are on the way.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="#">Browse courses (soon)</Link>
        </Button>
      </div>
    </main>
  )
}

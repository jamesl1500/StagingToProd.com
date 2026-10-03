import type { Metadata } from 'next'

import { NotFoundView } from '@/components/NotFound'
import { SiteFooter } from '@/components/SiteFooter'
import { display, mono } from '@/lib/fonts'
import '@/styles/globals.scss'

export const metadata: Metadata = {
  title: 'Page not found · StagingToProd',
  robots: { index: false },
}

// Unmatched URLs skip both root layouts (site and /admin), so this page brings its own shell.
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <NotFoundView />
        <SiteFooter />
      </body>
    </html>
  )
}

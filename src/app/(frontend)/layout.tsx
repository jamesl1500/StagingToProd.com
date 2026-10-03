import type { Metadata } from 'next'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { display, mono } from '@/lib/fonts'
import { siteUrl } from '@/lib/format'
import '@/styles/globals.scss'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'StagingToProd',
    template: '%s · StagingToProd',
  },
  description:
    'Lessons, courses and videos that take you from learning to code to shipping as a software engineer.',
  openGraph: { siteName: 'StagingToProd', type: 'website' },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}

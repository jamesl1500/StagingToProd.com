import type { Metadata } from 'next'
import React from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'StagingToProd',
    template: '%s · StagingToProd',
  },
  description:
    'Lessons, courses and videos that take you from learning to code to shipping as a software engineer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}

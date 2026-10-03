'use client'

import { useState } from 'react'

import styles from './CodeBlock.module.scss'

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className={styles.copy}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard can be blocked (e.g. insecure context); nothing else to do.
        }
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

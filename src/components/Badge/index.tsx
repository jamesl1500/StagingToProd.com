import type { ReactNode } from 'react'

import styles from './Badge.module.scss'

export function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode
  variant?: 'default' | 'solid' | 'muted'
}) {
  const cls = [styles.badge, variant !== 'default' && styles[variant]].filter(Boolean).join(' ')
  return <span className={cls}>{children}</span>
}

import type { ReactNode } from 'react'

import styles from './PageHeader.module.scss'

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className={styles.header}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1 className={styles.title}>{title}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
      {children && <div className={styles.extra}>{children}</div>}
    </header>
  )
}

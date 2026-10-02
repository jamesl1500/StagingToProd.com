import type { CalloutBlock } from '@/payload-types'

import styles from './Callout.module.scss'

const labels: Record<CalloutBlock['variant'], string> = {
  note: '// note',
  tip: '// tip',
  warning: '!! warning',
}

export function Callout({ variant, title, content }: Pick<CalloutBlock, 'variant' | 'title' | 'content'>) {
  return (
    <aside className={`${styles.callout} ${styles[variant] ?? ''}`} role="note">
      <span className={styles.label}>{labels[variant]}</span>
      {title && <p className={styles.title}>{title}</p>}
      <p className={styles.content}>{content}</p>
    </aside>
  )
}

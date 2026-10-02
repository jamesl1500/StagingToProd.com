import type { ReactNode } from 'react'

import styles from './Container.module.scss'

export function Container({ children, as: Tag = 'main' }: { children: ReactNode; as?: 'main' | 'div' }) {
  return <Tag className={styles.container}>{children}</Tag>
}

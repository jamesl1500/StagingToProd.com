import Link from 'next/link'

import styles from './Breadcrumbs.module.scss'

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className={styles.item} aria-current={last ? 'page' : undefined}>
              {item.href && !last ? <Link href={item.href}>{item.label}</Link> : item.label}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

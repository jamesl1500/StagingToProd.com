import Link from 'next/link'

import styles from './Filters.module.scss'

type Option = { value: string; label: string }

/** Link-based filter chips: each click is a URL with updated query params, so no JS is needed. */
export function Filters({
  basePath,
  params,
  groups,
}: {
  basePath: string
  params: Record<string, string | undefined>
  groups: { name: string; label: string; options: Option[] }[]
}) {
  const hrefWith = (name: string, value?: string) => {
    const next = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v && k !== name) next.set(k, v)
    if (value) next.set(name, value)
    const qs = next.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <div className={styles.filters}>
      {groups.map((group) => (
        <div key={group.name} className={styles.group}>
          <span className={styles.label}>{group.label}</span>
          <Link
            href={hrefWith(group.name)}
            className={`${styles.chip} ${!params[group.name] ? styles.active : ''}`}
          >
            All
          </Link>
          {group.options.map((o) => (
            <Link
              key={o.value}
              href={hrefWith(group.name, o.value)}
              className={`${styles.chip} ${params[group.name] === o.value ? styles.active : ''}`}
            >
              {o.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

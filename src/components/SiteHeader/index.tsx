import Link from 'next/link'

import styles from './SiteHeader.module.scss'

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          staging<span>-&gt;</span>prod
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <Link href="/#courses" className={styles.link}>
            Courses
          </Link>
          <Link href="/#about" className={styles.link}>
            About
          </Link>
        </nav>
      </div>
    </header>
  )
}

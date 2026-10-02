import styles from './SiteFooter.module.scss'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>© {new Date().getFullYear()} StagingToProd</span>
        <span>Build. Test. Ship.</span>
      </div>
    </footer>
  )
}

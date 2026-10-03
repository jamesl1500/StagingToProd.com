import Link from 'next/link'

import { Avatar } from '@/components/Avatar'
import { SearchForm } from '@/components/SearchForm'
import { getProfile } from '@/lib/profile'
import { avatarUrl } from '@/lib/profile/avatar'
import { getLearner } from '@/lib/supabase/auth'

import styles from './SiteHeader.module.scss'

export async function SiteHeader() {
  const learner = await getLearner()
  const profile = learner ? await getProfile() : null

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          staging<span>-&gt;</span>prod
        </Link>
        <div className={styles.search}>
          <SearchForm size="small" placeholder="search" />
        </div>
        <nav className={styles.nav} aria-label="Main">
          <Link href="/courses" className={styles.link}>
            Courses
          </Link>
          <Link href="/search" className={`${styles.link} ${styles.searchLink}`}>
            Search
          </Link>
          {learner ? (
            <Link href="/account" className={styles.me}>
              <Avatar src={avatarUrl(profile?.avatar_path)} name={profile?.display_name ?? learner.email} size="sm" />
              <span className={styles.meLabel}>Account</span>
            </Link>
          ) : (
            <Link href="/login" className={styles.account}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

import Link from 'next/link'
import type { ReactNode } from 'react'

import { Badge } from '@/components/Badge'
import { mediaUrl } from '@/lib/media'
import { languageLabels, levelLabels, pad } from '@/lib/format'
import type { Course } from '@/payload-types'

import styles from './CourseCard.module.scss'

export function CourseGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>
}

export function CourseCard({ course, index }: { course: Course; index: number }) {
  const cover = mediaUrl(course.cover)
  return (
    <Link href={`/courses/${course.slug}`} className={styles.card}>
      {cover && <div className={styles.cover} style={{ backgroundImage: `url(${cover})` }} />}
      <div className={styles.top}>
        <span className={styles.index}>{pad(index)}</span>
        <span className={styles.arrow} aria-hidden="true">
          -&gt;
        </span>
      </div>
      <h3 className={styles.title}>{course.title}</h3>
      <p className={styles.summary}>{course.summary}</p>
      <div className={styles.tags}>
        <Badge>{languageLabels[course.language]}</Badge>
        <Badge>{levelLabels[course.level]}</Badge>
        {course.priceMode === 'free' ? <Badge variant="solid">Free</Badge> : <Badge variant="muted">Pro</Badge>}
      </div>
    </Link>
  )
}

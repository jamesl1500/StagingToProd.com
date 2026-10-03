import Link from 'next/link'

import { Badge } from '@/components/Badge'
import type { OutlineModule } from '@/lib/content'
import { formatDuration, pad } from '@/lib/format'

import styles from './CourseOutline.module.scss'

/** Modules and lessons in order, with free / locked markers. */
export function CourseOutline({
  courseSlug,
  modules,
  currentLessonId,
  compact = false,
}: {
  courseSlug: string
  modules: OutlineModule[]
  currentLessonId?: number
  compact?: boolean
}) {
  // Lesson numbers run across the whole course, not per module.
  const offsets = modules.map((_, mi) =>
    modules.slice(0, mi).reduce((sum, m) => sum + m.lessons.length, 0),
  )
  return (
    <div className={`${styles.outline} ${compact ? styles.compact : ''}`}>
      {modules.map((mod, mi) => {
        const total = mod.lessons.reduce((sum, l) => sum + (l.duration ?? 0), 0)
        return (
          <section key={mod.id} className={styles.module}>
            <div className={styles.moduleHead}>
              <h3 className={styles.moduleTitle}>
                {pad(mi + 1)} {mod.title}
              </h3>
              <span className={styles.moduleMeta}>
                {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                {total > 0 && ` · ${formatDuration(total)}`}
              </span>
            </div>
            {mod.summary && <p className={styles.moduleSummary}>{mod.summary}</p>}
            <ol className={styles.lessons}>
              {mod.lessons.map((lesson, li) => {
                const n = offsets[mi] + li + 1
                const current = lesson.id === currentLessonId
                return (
                  <li key={lesson.id} className={styles.lesson}>
                    <Link
                      href={`/courses/${courseSlug}/${lesson.slug}`}
                      className={`${styles.row} ${current ? styles.current : ''}`}
                      aria-current={current ? 'page' : undefined}
                    >
                      <span className={styles.num}>{String(n).padStart(2, '0')}</span>
                      <span className={styles.lessonTitle}>{lesson.title}</span>
                      <span className={styles.right}>
                        {lesson.isFree && !compact && <Badge variant="solid">Free</Badge>}
                        {formatDuration(lesson.duration) && (
                          <span className={styles.duration}>{formatDuration(lesson.duration)}</span>
                        )}
                        {lesson.locked && (
                          <span className={styles.lock} aria-label="Locked">
                            [lock]
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}

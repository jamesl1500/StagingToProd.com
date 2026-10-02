import type { Metadata } from 'next'
import Link from 'next/link'

import { Badge } from '@/components/Badge'
import { Container } from '@/components/Container'
import { CourseCard, CourseGrid } from '@/components/CourseCard'
import { PageHeader } from '@/components/PageHeader'
import { SearchForm } from '@/components/SearchForm'
import { getCourses, searchLessons } from '@/lib/content'
import { pad } from '@/lib/format'
import { firstParam, type SearchParams } from '@/lib/params'

import styles from './page.module.scss'

export const dynamic = 'force-dynamic'

type Props = { searchParams: SearchParams }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = firstParam((await searchParams).q)?.trim()
  return {
    title: q ? `Search: ${q}` : 'Search',
    // Result pages are thin and endless; keep them out of the index.
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const q = firstParam((await searchParams).q)?.trim().slice(0, 100) || ''

  const [courses, lessons] = q
    ? await Promise.all([getCourses({ q }, 12), searchLessons(q, 30)])
    : [[], []]
  const total = courses.length + lessons.length

  return (
    <Container>
      <PageHeader
        eyebrow="[--] search"
        title="Search"
        lead="Find courses and individual lessons by title, summary or topic."
      >
        <SearchForm defaultValue={q} placeholder="try: generics, async, sql joins" />
      </PageHeader>

      {!q ? (
        <div className={styles.empty}>
          <span>&gt; Type a query to search every published course and lesson.</span>
          <Link href="/courses" className={styles.link}>
            Or browse all courses -&gt;
          </Link>
        </div>
      ) : total === 0 ? (
        <div className={styles.empty}>
          <span>&gt; No results for &quot;{q}&quot;.</span>
          <span>Try a shorter query or a language name.</span>
          <Link href="/courses" className={styles.link}>
            Browse all courses -&gt;
          </Link>
        </div>
      ) : (
        <>
          <p className={styles.count}>
            {pad(total)} {total === 1 ? 'result' : 'results'} for &quot;{q}&quot;
          </p>

          {courses.length > 0 && (
            <section className={styles.section} aria-labelledby="course-results">
              <h2 id="course-results" className={styles.heading}>
                Courses <span>{pad(courses.length)}</span>
              </h2>
              <CourseGrid>
                {courses.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i + 1} />
                ))}
              </CourseGrid>
            </section>
          )}

          {lessons.length > 0 && (
            <section className={styles.section} aria-labelledby="lesson-results">
              <h2 id="lesson-results" className={styles.heading}>
                Lessons <span>{pad(lessons.length)}</span>
              </h2>
              <ol className={styles.lessons}>
                {lessons.map((lesson, i) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/courses/${lesson.course.slug}/${lesson.slug}`}
                      className={styles.lesson}
                    >
                      <span className={styles.index}>{pad(i + 1)}</span>
                      <span className={styles.body}>
                        <span className={styles.course}>{lesson.course.title}</span>
                        <span className={styles.title}>{lesson.title}</span>
                        {lesson.summary && <span className={styles.summary}>{lesson.summary}</span>}
                      </span>
                      {(lesson.isFree || lesson.course.priceMode === 'free') && (
                        <Badge variant="solid">Free</Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </Container>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { CourseCard, CourseGrid } from '@/components/CourseCard'
import { Filters } from '@/components/Filters'
import { PageHeader } from '@/components/PageHeader'
import { SearchForm } from '@/components/SearchForm'
import { getCourses } from '@/lib/content'
import { languageLabels, levelLabels } from '@/lib/format'
import { firstParam, type SearchParams } from '@/lib/params'
import type { Course } from '@/payload-types'

import styles from './page.module.scss'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Courses',
  description:
    'Browse courses on JavaScript, TypeScript, Python, Go and the skills you need to work as a software engineer.',
  alternates: { canonical: '/courses' },
}

const isLanguage = (v?: string): v is Course['language'] => !!v && v in languageLabels
const isLevel = (v?: string): v is Course['level'] => !!v && v in levelLabels

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const q = firstParam(sp.q)?.trim().slice(0, 100) || undefined
  const languageParam = firstParam(sp.language)
  const levelParam = firstParam(sp.level)
  const language = isLanguage(languageParam) ? languageParam : undefined
  const level = isLevel(levelParam) ? levelParam : undefined

  const courses = await getCourses({ q, language, level })
  const filtered = Boolean(q || language || level)

  return (
    <Container>
      <PageHeader
        eyebrow="[01] courses"
        title="Courses"
        lead="Structured paths from first program to production code. Every course is video lessons, written notes and a project you ship."
      />

      <div className={styles.toolbar}>
        <SearchForm action="/courses" defaultValue={q} placeholder="filter courses" />
        <Filters
          basePath="/courses"
          params={{ q, language, level }}
          groups={[
            {
              name: 'language',
              label: 'Language',
              options: Object.entries(languageLabels).map(([value, label]) => ({ value, label })),
            },
            {
              name: 'level',
              label: 'Level',
              options: Object.entries(levelLabels).map(([value, label]) => ({ value, label })),
            },
          ]}
        />
      </div>

      <div className={styles.results}>
        <span className={styles.count}>
          [{String(courses.length).padStart(2, '0')}] {courses.length === 1 ? 'course' : 'courses'}
          {q && ` matching "${q}"`}
        </span>
        {filtered && (
          <Link href="/courses" className={styles.clear}>
            Clear filters
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className={styles.empty}>
          <span>&gt; No courses match those filters.</span>
          {filtered && (
            <Link href="/courses" className={styles.clear}>
              Show all courses
            </Link>
          )}
        </div>
      ) : (
        <CourseGrid>
          {courses.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i + 1} />
          ))}
        </CourseGrid>
      )}
    </Container>
  )
}

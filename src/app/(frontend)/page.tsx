import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { Button } from '@/components/Button'
import type { Course } from '@/payload-types'

import styles from './page.module.scss'

// Reads published courses from the CMS on every request.
export const dynamic = 'force-dynamic'

const languageLabels: Record<Course['language'], string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  csharp: 'C#',
  sql: 'SQL',
  general: 'Career',
}

const steps = [
  { title: 'Learn', body: 'Short video lessons with written notes and code you can copy.' },
  { title: 'Build', body: 'Every course ends in a real project, not a toy exercise.' },
  { title: 'Ship', body: 'Deploy it, review it like a team would, and add it to your portfolio.' },
]

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const { docs: courses } = await payload.find({
    collection: 'courses',
    where: { _status: { equals: 'published' } },
    sort: '-createdAt',
    depth: 0,
    limit: 12,
  })

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>[00] staging -&gt; prod</p>
        <h1 className={styles.title}>
          Learn to code. Ship to prod.
          <span className={styles.cursor} aria-hidden="true" />
        </h1>
        <p className={styles.lead}>
          Lessons, courses and videos that take you from your first line of code to shipping as a
          software engineer.
        </p>
        <div className={styles.actions}>
          <Button href="#courses">Browse courses</Button>
          <Button href="#about" variant="outline">
            How it works
          </Button>
        </div>
      </section>

      <section id="courses" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Courses</h2>
          <span className={styles.count}>
            [{String(courses.length).padStart(2, '0')}] available
          </span>
        </div>

        {courses.length === 0 ? (
          <p className={styles.empty}>&gt; No courses published yet. Check back soon.</p>
        ) : (
          <div className={styles.grid}>
            {courses.map((course, i) => (
              <article key={course.id} className={styles.card}>
                <span className={styles.cardIndex}>[{String(i + 1).padStart(2, '0')}]</span>
                <h3 className={styles.cardTitle}>{course.title}</h3>
                <p className={styles.cardSummary}>{course.summary}</p>
                <div className={styles.tags}>
                  <span className={styles.tag}>{languageLabels[course.language]}</span>
                  <span className={styles.tag}>{course.level}</span>
                  {course.priceMode === 'free' && <span className={styles.tag}>Free</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="about" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>How it works</h2>
        </div>
        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.cardIndex}>[{String(i + 1).padStart(2, '0')}]</span>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardSummary}>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}

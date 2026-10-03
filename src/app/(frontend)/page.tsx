import { Button } from '@/components/Button'
import { CourseCard, CourseGrid } from '@/components/CourseCard'
import { getCourses } from '@/lib/content'
import { pad } from '@/lib/format'

import styles from './page.module.scss'

// Reads published courses from the CMS on every request.
export const dynamic = 'force-dynamic'

const steps = [
  { title: 'Learn', body: 'Short video lessons with written notes and code you can copy.' },
  { title: 'Build', body: 'Every course ends in a real project, not a toy exercise.' },
  { title: 'Ship', body: 'Deploy it, review it like a team would, and add it to your portfolio.' },
]

export default async function HomePage() {
  const courses = await getCourses({}, 6)

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
          <Button href="/courses">Browse courses</Button>
          <Button href="#about" variant="outline">
            How it works
          </Button>
        </div>
      </section>

      <section id="courses" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Latest courses</h2>
          <Button href="/courses" variant="ghost">
            All courses -&gt;
          </Button>
        </div>

        {courses.length === 0 ? (
          <p className={styles.empty}>&gt; No courses published yet. Check back soon.</p>
        ) : (
          <CourseGrid>
            {courses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i + 1} />
            ))}
          </CourseGrid>
        )}
      </section>

      <section id="about" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>How it works</h2>
        </div>
        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.cardIndex}>{pad(i + 1)}</span>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardSummary}>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}

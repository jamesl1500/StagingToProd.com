import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Badge } from '@/components/Badge'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { CourseOutline } from '@/components/CourseOutline'
import { RichText } from '@/components/RichText'
import { VideoPlayer } from '@/components/VideoPlayer'
import { getLesson } from '@/lib/content'
import { formatDuration, languageLabels } from '@/lib/format'

import styles from './page.module.scss'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string; lesson: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lesson: lessonSlug } = await params
  const data = await getLesson(slug, lessonSlug)
  if (!data) return { title: 'Lesson not found' }
  const description = data.lesson.summary || data.course.summary
  return {
    title: `${data.lesson.title} · ${data.course.title}`,
    description,
    alternates: { canonical: `/courses/${slug}/${lessonSlug}` },
    openGraph: { type: 'article', title: data.lesson.title, description },
  }
}

export default async function LessonPage({ params }: Props) {
  const { slug, lesson: lessonSlug } = await params
  const data = await getLesson(slug, lessonSlug)
  if (!data) notFound()

  const { course, outline, lesson, video, locked, prev, next } = data
  const position = outline.lessons.findIndex((l) => l.id === lesson.id) + 1
  const moduleTitle = outline.modules.find((m) => m.lessons.some((l) => l.id === lesson.id))?.title
  const playback = video?.playbackOptions?.find((o) => o.playbackPolicy === 'public') ?? video?.playbackOptions?.[0]
  const duration = formatDuration(video?.duration)
  const loginHref = `/login?next=${encodeURIComponent(`/courses/${course.slug}/${lesson.slug}`)}`

  const outlineEl = (
    <CourseOutline courseSlug={course.slug} modules={outline.modules} currentLessonId={lesson.id} compact />
  )

  return (
    <Container>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Course outline">
          <div className={styles.sidebarHead}>
            <Link href={`/courses/${course.slug}`}>{course.title}</Link>
            <span className={styles.progress}>
              Lesson {position} of {outline.lessons.length}
            </span>
          </div>
          <details className={styles.mobileOutline}>
            <summary>Course outline</summary>
            {outlineEl}
          </details>
          <div className={styles.desktopOutline}>{outlineEl}</div>
        </aside>

        <article className={styles.main}>
          <header className={styles.header}>
            <Breadcrumbs
              items={[
                { label: 'Courses', href: '/courses' },
                { label: course.title, href: `/courses/${course.slug}` },
                { label: lesson.title },
              ]}
            />
            {moduleTitle && <p className={styles.eyebrow}>{moduleTitle}</p>}
            <h1 className={styles.title}>{lesson.title}</h1>
            <div className={styles.metaRow}>
              <Badge>{languageLabels[course.language]}</Badge>
              {duration && <Badge variant="muted">{duration}</Badge>}
              {lesson.isFree && course.priceMode !== 'free' && <Badge variant="solid">Free preview</Badge>}
            </div>
            {lesson.summary && <p className={styles.summary}>{lesson.summary}</p>}
          </header>

          {locked ? (
            <section className={styles.locked}>
              <span className={styles.lockedLabel}>[lock] members only</span>
              <h2 className={styles.lockedTitle}>This lesson is part of the full course</h2>
              <p className={styles.lockedText}>
                Sign in to keep your progress. Course purchases and memberships are coming soon; until
                then, try the free preview lessons.
              </p>
              <div className={styles.lockedActions}>
                <Button href={loginHref}>Sign in</Button>
                <Button href={`/courses/${course.slug}#outline`} variant="outline">
                  See free lessons
                </Button>
              </div>
            </section>
          ) : (
            <>
              {playback?.playbackId ? (
                <VideoPlayer
                  playbackId={playback.playbackId}
                  title={lesson.title}
                  poster={playback.posterUrl}
                />
              ) : (
                lesson.video && <div className={styles.noVideo}>&gt; Video is still processing.</div>
              )}
              <RichText data={lesson.body} />
            </>
          )}

          <nav className={styles.pager} aria-label="Lesson navigation">
            {prev ? (
              <Link href={`/courses/${course.slug}/${prev.slug}`} className={styles.pagerLink}>
                <span>&lt;- Previous</span>
                <strong>{prev.title}</strong>
              </Link>
            ) : (
              <div className={styles.pagerEmpty} />
            )}
            {next ? (
              <Link href={`/courses/${course.slug}/${next.slug}`} className={`${styles.pagerLink} ${styles.next}`}>
                <span>Next -&gt;</span>
                <strong>{next.title}</strong>
              </Link>
            ) : (
              <Link href={`/courses/${course.slug}`} className={`${styles.pagerLink} ${styles.next}`}>
                <span>Finished -&gt;</span>
                <strong>Back to course</strong>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </Container>
  )
}

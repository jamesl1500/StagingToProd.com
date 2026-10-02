import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Badge } from '@/components/Badge'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { CourseOutline } from '@/components/CourseOutline'
import { RichText } from '@/components/RichText'
import { getCourseBySlug } from '@/lib/content'
import { formatDuration, languageLabels, levelLabels, siteUrl } from '@/lib/format'
import { mediaUrl } from '@/lib/media'
import type { Author, Course } from '@/payload-types'

import styles from './page.module.scss'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

const priceLabel: Record<Course['priceMode'], string> = {
  free: 'Free',
  'one-time': 'One-time purchase',
  subscription: 'Pro membership',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getCourseBySlug(slug)
  if (!data) return { title: 'Course not found' }
  const { course } = data
  const cover = mediaUrl(course.cover)
  return {
    title: course.title,
    description: course.summary,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      type: 'website',
      title: course.title,
      description: course.summary,
      url: `/courses/${course.slug}`,
      images: cover ? [{ url: cover }] : undefined,
    },
    twitter: { card: cover ? 'summary_large_image' : 'summary', title: course.title, description: course.summary },
  }
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params
  const data = await getCourseBySlug(slug)
  if (!data) notFound()

  const { course, modules, lessons } = data
  const author = typeof course.author === 'object' ? (course.author as Author | null) : null
  const cover = mediaUrl(course.cover)
  const totalSeconds = lessons.reduce((sum, l) => sum + (l.duration ?? 0), 0)
  const freeCount = lessons.filter((l) => l.isFree).length
  const first = lessons[0]
  const firstOpen = lessons.find((l) => !l.locked)
  const videoCount = lessons.filter((l) => l.duration).length

  const includes = [
    videoCount > 0 && `${videoCount} video ${videoCount === 1 ? 'lesson' : 'lessons'}`,
    totalSeconds > 0 && `${formatDuration(totalSeconds)} of video`,
    `${lessons.length} written ${lessons.length === 1 ? 'lesson' : 'lessons'} with code samples`,
    freeCount > 0 && course.priceMode !== 'free' && `${freeCount} free preview ${freeCount === 1 ? 'lesson' : 'lessons'}`,
    `${levelLabels[course.level]} level`,
  ].filter(Boolean) as string[]

  // Structured data so search engines can show this as a course.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.summary,
    url: `${siteUrl}/courses/${course.slug}`,
    provider: { '@type': 'Organization', name: 'StagingToProd', sameAs: siteUrl },
    educationalLevel: levelLabels[course.level],
    isAccessibleForFree: course.priceMode === 'free',
    ...(cover && { image: cover }),
  }

  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className={styles.hero}>
        <div className={styles.intro}>
          <Breadcrumbs items={[{ label: 'Courses', href: '/courses' }, { label: course.title }]} />
          <div className={styles.badges}>
            <Badge>{languageLabels[course.language]}</Badge>
            <Badge>{levelLabels[course.level]}</Badge>
            {course.priceMode === 'free' && <Badge variant="solid">Free</Badge>}
          </div>
          <h1 className={styles.title}>{course.title}</h1>
          <p className={styles.summary}>{course.summary}</p>
          <div className={styles.actions}>
            {first ? (
              <Button href={`/courses/${course.slug}/${(firstOpen ?? first).slug}`}>
                {course.priceMode === 'free' || !firstOpen || firstOpen === first ? 'Start course' : 'Watch free preview'}
              </Button>
            ) : (
              <Button disabled>Lessons coming soon</Button>
            )}
            {lessons.length > 0 && (
              <Button href="#outline" variant="outline">
                View outline
              </Button>
            )}
          </div>
        </div>

        <aside className={styles.panel}>
          {cover ? (
            <div className={styles.cover} style={{ backgroundImage: `url(${cover})` }} role="img" aria-label={course.title} />
          ) : (
            <div className={styles.coverFallback} aria-hidden="true">
              {'</>'}
            </div>
          )}
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>Modules</dt>
              <dd>{String(modules.length).padStart(2, '0')}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Lessons</dt>
              <dd>{String(lessons.length).padStart(2, '0')}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Video</dt>
              <dd>{formatDuration(totalSeconds) ?? '--'}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Free previews</dt>
              <dd>{course.priceMode === 'free' ? 'All' : String(freeCount).padStart(2, '0')}</dd>
            </div>
          </dl>
          <div className={styles.price}>
            <span>Access</span>
            <strong>{priceLabel[course.priceMode]}</strong>
          </div>
        </aside>
      </section>

      <div className={styles.body}>
        <div className={styles.section}>
          {course.description && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>About this course</h2>
              <RichText data={course.description} />
            </section>
          )}

          <section id="outline" className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Course outline</h2>
              <span className={styles.meta}>
                {modules.length} modules · {lessons.length} lessons
              </span>
            </div>
            {modules.length > 0 ? (
              <CourseOutline courseSlug={course.slug} modules={modules} />
            ) : (
              <p className={styles.emptyOutline}>&gt; Lessons are being recorded. Check back soon.</p>
            )}
          </section>
        </div>

        <aside className={styles.side}>
          <div className={styles.box}>
            <h2 className={styles.boxTitle}>This course includes</h2>
            <ul className={styles.list}>
              {includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {author && (
            <div className={styles.box}>
              <h2 className={styles.boxTitle}>Your instructor</h2>
              <div className={styles.author}>
                <div
                  className={styles.avatar}
                  style={mediaUrl(author.avatar) ? { backgroundImage: `url(${mediaUrl(author.avatar)})` } : undefined}
                  aria-hidden="true"
                />
                <div>
                  <p className={styles.authorName}>{author.name}</p>
                </div>
              </div>
              {author.bio && <p className={styles.authorBio}>{author.bio}</p>}
              {author.links && author.links.length > 0 && (
                <div className={styles.links}>
                  {author.links.map((link) => (
                    <a key={link.id ?? link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label} -&gt;
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {course.tags && course.tags.length > 0 && (
            <div className={styles.box}>
              <h2 className={styles.boxTitle}>Topics</h2>
              <div className={styles.tags}>
                {course.tags.map((tag) => (
                  <Badge key={tag} variant="muted">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </Container>
  )
}

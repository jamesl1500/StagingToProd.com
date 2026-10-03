import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { SearchForm } from '@/components/SearchForm'

import styles from './NotFound.module.scss'

export function NotFoundView() {
  return (
    <Container>
      <section className={styles.wrap}>
        <p className={styles.code}>[404]</p>
        <h1 className={styles.title}>This route never made it to prod.</h1>
        <pre className={styles.log} aria-hidden="true">
          {`$ curl -I ${'<this page>'}\nHTTP/1.1 404 Not Found\n> nothing deployed here`}
        </pre>
        <p className={styles.lead}>
          The page may have moved, or the link is wrong. Search for it or head back to the courses.
        </p>
        <SearchForm />
        <div className={styles.actions}>
          <Button href="/courses">Browse courses</Button>
          <Button href="/" variant="outline">
            Home
          </Button>
        </div>
      </section>
    </Container>
  )
}

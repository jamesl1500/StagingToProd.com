import styles from './SearchForm.module.scss'

/** Plain GET form, works without JavaScript. */
export function SearchForm({
  defaultValue = '',
  action = '/search',
  size = 'default',
  placeholder = 'search lessons and courses',
}: {
  defaultValue?: string
  action?: string
  size?: 'default' | 'small'
  placeholder?: string
}) {
  return (
    <form
      action={action}
      method="get"
      role="search"
      className={`${styles.form} ${size === 'small' ? styles.small : ''}`}
    >
      <span className={styles.prompt} aria-hidden="true">
        &gt;
      </span>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label="Search"
        className={styles.input}
      />
      <button type="submit" className={styles.submit}>
        Search
      </button>
    </form>
  )
}

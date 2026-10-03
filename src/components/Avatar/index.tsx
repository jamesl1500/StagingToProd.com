import styles from './Avatar.module.scss'

const initials = (name: string | null | undefined) =>
  (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '??'

/** Square avatar with a monospace initials fallback. */
export function Avatar({
  src,
  name,
  size = 'md',
}: {
  src: string | null | undefined
  name: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <span className={`${styles.avatar} ${styles[size]}`}>
      {src ? (
        // Avatars come from Supabase Storage at their final size, so next/image adds nothing here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ? `${name}'s avatar` : 'Avatar'} className={styles.image} />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </span>
  )
}

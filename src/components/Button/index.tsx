import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import styles from './Button.module.scss'

type Variant = 'primary' | 'outline' | 'ghost'

type CommonProps = {
  variant?: Variant
  className?: string
  children: ReactNode
}

type ButtonAsLink = CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, 'className'>
type ButtonAsButton = CommonProps & { href?: undefined } & Omit<ComponentProps<'button'>, 'className'>

/** Square, monospace button. Renders a Next.js Link when given `href`. */
export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = 'primary', className, children, ...rest } = props
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')

  if (rest.href !== undefined) {
    return (
      <Link className={classes} {...(rest as Omit<ButtonAsLink, keyof CommonProps>)}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...(rest as Omit<ButtonAsButton, keyof CommonProps>)}>
      {children}
    </button>
  )
}

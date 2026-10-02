import { codeToHtml } from 'shiki'

import { CopyButton } from './CopyButton'
import styles from './CodeBlock.module.scss'

const labels: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TSX',
  js: 'JavaScript',
  jsx: 'JSX',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  csharp: 'C#',
  sql: 'SQL',
  bash: 'Bash',
  json: 'JSON',
  yaml: 'YAML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  plaintext: 'Text',
}

/** Server-rendered, VS Code-quality syntax highlighting. No highlighting JS ships to the browser. */
export async function CodeBlock({ code, language = 'plaintext' }: { code: string; language?: string }) {
  let html: string
  try {
    html = await codeToHtml(code, { lang: language, theme: 'vitesse-black' })
  } catch {
    // Unknown language: fall back to plain text rather than failing the page.
    html = await codeToHtml(code, { lang: 'plaintext', theme: 'vitesse-black' })
  }

  return (
    <figure className={styles.block}>
      <figcaption className={styles.bar}>
        <span className={styles.lang}>{labels[language] ?? language}</span>
        <CopyButton code={code} />
      </figcaption>
      <div className={styles.code} dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  )
}

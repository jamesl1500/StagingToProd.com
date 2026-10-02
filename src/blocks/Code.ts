import { CodeBlock } from '@payloadcms/richtext-lexical'

/** Code sample with a language picker; rendered with Shiki on the lesson page. */
export const Code = CodeBlock({
  defaultLanguage: 'ts',
  languages: {
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
    plaintext: 'Plain text',
  },
})

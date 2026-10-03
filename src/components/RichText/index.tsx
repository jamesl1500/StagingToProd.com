import {
  type JSXConvertersFunction,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { Callout } from '@/components/Callout'
import { CodeBlock } from '@/components/CodeBlock'
import type { CalloutBlock } from '@/payload-types'

import styles from './RichText.module.scss'

type CodeFields = { code: string; language?: string }

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    Code: ({ node }: { node: { fields: CodeFields } }) => (
      <CodeBlock code={node.fields.code} language={node.fields.language} />
    ),
    callout: ({ node }: { node: { fields: CalloutBlock } }) => <Callout {...node.fields} />,
  },
})

export function RichText({ data }: { data: SerializedEditorState | null | undefined }) {
  if (!data) return null
  return <PayloadRichText data={data} converters={converters} className={styles.prose} disableContainer={false} />
}

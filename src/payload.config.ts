import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Uploads go to Supabase Storage (S3-compatible) when its keys are set;
// otherwise they fall back to the local ./media folder for development.
const supabaseStorageEnabled = Boolean(
  process.env.SUPABASE_S3_ENDPOINT &&
    process.env.SUPABASE_S3_ACCESS_KEY_ID &&
    process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
)

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · StagingToProd Admin',
    },
  },
  collections: [Admins, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // CMS tables live in their own schema so Supabase's public Data API never exposes them.
    schemaName: 'payload',
    migrationDir: path.resolve(dirname, 'migrations'),
    // In development Payload pushes schema changes directly; in production it runs migrations on boot.
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    s3Storage({
      enabled: supabaseStorageEnabled,
      collections: {
        media: true,
      },
      bucket: process.env.SUPABASE_S3_BUCKET || 'media',
      config: {
        endpoint: process.env.SUPABASE_S3_ENDPOINT,
        region: process.env.SUPABASE_S3_REGION || 'us-west-2',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})

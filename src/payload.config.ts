import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { muxVideoPlugin } from '@oversightstudio/mux-video'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Admins } from './collections/Admins'
import { Authors } from './collections/Authors'
import { Courses } from './collections/Courses'
import { Lessons } from './collections/Lessons'
import { Media } from './collections/Media'
import { Modules } from './collections/Modules'
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
    theme: 'dark',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · StagingToProd Admin',
    },
  },
  collections: [Courses, Modules, Lessons, Authors, Media, Admins],
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
    // Adds the Videos collection: upload straight from /admin to Mux; Mux calls /api/mux/webhook when ready.
    // Always enabled so the schema is stable; uploads only work once the MUX_* keys are set.
    muxVideoPlugin({
      enabled: true,
      initSettings: {
        tokenId: process.env.MUX_TOKEN_ID || '',
        tokenSecret: process.env.MUX_TOKEN_SECRET || '',
        webhookSecret: process.env.MUX_WEBHOOK_SIGNING_SECRET || '',
      },
      uploadSettings: {
        cors_origin: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      },
      adminThumbnail: 'image',
    }),
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

'use client'

import { useEffect, useRef, useState } from 'react'

import { Avatar } from '@/components/Avatar'
import { AVATAR_BUCKET, avatarUrl } from '@/lib/profile/avatar'
import { avatarTypes, limits } from '@/lib/profile/options'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'

import styles from './Onboarding.module.scss'

const SIZE = 512

/** Center-crops to a square and re-encodes as a 512px WebP so avatars stay small. */
async function toSquareWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = Math.min(SIZE, side)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    canvas.width,
    canvas.height,
  )
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode'))), 'image/webp', 0.9),
  )
}

/**
 * Uploads straight from the browser to Supabase Storage (the file never passes through
 * our server), then hands the stored path to the form in a hidden input.
 */
export function AvatarUpload({
  userId,
  initialPath,
  name,
  error,
}: {
  userId: string
  initialPath: string | null
  name: string | null
  error?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [path, setPath] = useState(initialPath ?? '')
  const [preview, setPreview] = useState<string | null>(avatarUrl(initialPath))
  const [status, setStatus] = useState<'idle' | 'uploading'>('idle')
  const [message, setMessage] = useState<string | null>(error ?? null)

  // Release object URLs made for local previews.
  useEffect(() => () => void (preview?.startsWith('blob:') && URL.revokeObjectURL(preview)), [preview])

  async function onFile(file: File | undefined) {
    if (!file) return
    setMessage(null)
    if (!(avatarTypes as readonly string[]).includes(file.type)) {
      setMessage('Use a PNG, JPG, WebP or GIF image.')
      return
    }
    if (file.size > limits.avatarBytes * 5) {
      setMessage('That image is over 10 MB. Pick a smaller one.')
      return
    }

    setStatus('uploading')
    try {
      const blob = await toSquareWebp(file)
      const nextPath = `${userId}/avatar-${Date.now()}.webp`
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(nextPath, blob, { contentType: 'image/webp', cacheControl: '31536000', upsert: false })
      if (uploadError) throw uploadError

      // Drop an earlier upload from this visit that was never saved.
      if (path && path !== initialPath) await supabase.storage.from(AVATAR_BUCKET).remove([path])

      setPath(nextPath)
      setPreview(URL.createObjectURL(blob))
    } catch {
      setMessage('Upload failed. Check your connection and try again.')
    } finally {
      setStatus('idle')
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className={styles.avatarField}>
      <Avatar src={preview} name={name} size="lg" />
      <div className={styles.avatarControls}>
        <span className={styles.label} id="avatar-label">
          Avatar
        </span>
        <p className={styles.hint}>Square works best. We crop it to the center.</p>
        <div className={styles.avatarButtons}>
          <label className={`${styles.fileButton} ${status === 'uploading' ? styles.busy : ''}`}>
            <input
              ref={input}
              type="file"
              accept={avatarTypes.join(',')}
              className={styles.fileInput}
              aria-labelledby="avatar-label"
              disabled={status === 'uploading' || !isSupabaseConfigured}
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {status === 'uploading' ? 'Uploading...' : preview ? 'Change photo' : 'Upload photo'}
          </label>
          {preview && status === 'idle' && (
            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                setPath('')
                setPreview(null)
              }}
            >
              Remove
            </button>
          )}
        </div>
        {!isSupabaseConfigured && <p className={styles.hint}>Uploads need the Supabase keys in the environment.</p>}
        {message && (
          <p className={styles.fieldError} role="alert">
            {message}
          </p>
        )}
      </div>
      <input type="hidden" name="avatar_path" value={path} />
    </div>
  )
}

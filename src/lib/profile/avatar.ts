import { supabaseUrl } from '@/lib/supabase/env'

export const AVATAR_BUCKET = 'avatars'

/** Public URL for an avatar path stored on the profile. */
export function avatarUrl(path: string | null | undefined): string | null {
  if (!path || !supabaseUrl) return null
  return `${supabaseUrl}/storage/v1/object/public/${AVATAR_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`
}

/** Avatars must live in the learner's own folder: `<user id>/<file>`. */
export function isOwnAvatarPath(path: string, userId: string): boolean {
  const parts = path.split('/')
  return parts.length === 2 && parts[0] === userId && /^[\w.-]{1,100}$/.test(parts[1]) && !parts[1].startsWith('.')
}

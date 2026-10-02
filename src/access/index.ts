import type { Access, FieldAccess } from 'payload'

/** Any signed-in admin (owner or editor). */
export const isAdmin: Access = ({ req: { user } }) => Boolean(user)

/** Admins see everything; everyone else sees published documents only. */
export const adminsOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

/**
 * Lesson content (body and video) is readable through the API only for free lessons.
 * Paid lessons are loaded server-side after an access check (see the payments milestone).
 */
export const adminsOrFreeLesson: FieldAccess = ({ req: { user }, doc }) =>
  Boolean(user) || Boolean(doc?.isFree)

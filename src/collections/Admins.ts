import type { CollectionConfig } from 'payload'

/**
 * Accounts that can sign in to /admin. Learners never live here: they sign in
 * with Supabase Auth and have no access to the admin panel.
 */
export const Admins: CollectionConfig = {
  slug: 'admins',
  admin: {
    useAsTitle: 'email',
    group: 'Settings',
  },
  auth: true,
  access: {
    // Only signed-in admins can see or manage admin accounts.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => user?.role === 'owner',
    update: ({ req: { user }, id }) => user?.role === 'owner' || user?.id === id,
    delete: ({ req: { user } }) => user?.role === 'owner',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Editor', value: 'editor' },
      ],
      saveToJWT: true,
      access: {
        // Only owners can change roles.
        update: ({ req: { user } }) => user?.role === 'owner',
      },
    },
  ],
  hooks: {
    beforeChange: [
      // The very first admin account becomes the owner.
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'admins', req })
          if (totalDocs === 0) return { ...data, role: 'owner' }
        }
        return data
      },
    ],
  },
}

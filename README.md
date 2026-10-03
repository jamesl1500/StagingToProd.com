# StagingToProd.com

Lessons, courses and videos that take people from learning to code to shipping as software engineers.

One Next.js app serves the public site and the admin panel. Content is edited in [Payload CMS](https://payloadcms.com) at `/admin`; learners sign in with [Supabase Auth](https://supabase.com/docs/guides/auth). Both use the same Supabase Postgres database.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), TypeScript, React 19 |
| Styling | SCSS modules, shared tokens in `src/styles` (black-and-white theme) |
| Admin panel / CMS | Payload CMS 3, mounted at `/admin` |
| Database | Supabase Postgres. Payload tables live in the `payload` schema, learner tables in `public` |
| Learner auth | Supabase Auth via `@supabase/ssr` |
| File uploads | Supabase Storage through Payload's S3 adapter (falls back to `./media` locally) |
| Video | Mux, uploaded from the admin via `@oversightstudio/mux-video` |
| Tests | Vitest (integration), Playwright (e2e) |
| CI | GitHub Actions: lint, typecheck, migrate, tests, build |

## Getting started

1. Install dependencies (Node 22, pnpm 10):

   ```bash
   pnpm install
   ```

2. Copy the env file and fill it in:

   ```bash
   cp .env.example .env
   ```

   For a fully local setup, run `docker compose up -d` and use
   `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/stagingtoprod`.

3. Start the dev server:

   ```bash
   pnpm dev
   ```

4. Open http://localhost:3000/admin and create the first admin account. The first account becomes the **owner**; later ones default to **editor**.

## Project layout

```
src/
  app/
    (frontend)/        public site: home, /courses, lessons, /search, login, account
    (payload)/         Payload admin panel and REST/GraphQL API
    auth/              Supabase auth routes: callback, confirm, signout
  access/              Payload access rules
  blocks/              lesson editor blocks (Code, Callout)
  collections/         Courses, Modules, Lessons, Authors, Media, Admins
  components/          React components, each with its own .module.scss
  fields/              shared field helpers (slug)
  styles/              _tokens.scss (variables, mixins) and globals.scss
  lib/                 content queries, access rules, formatting
  lib/supabase/        Supabase clients, getLearner() and safeNext()
  migrations/          Payload database migrations
  proxy.ts             refreshes the learner's Supabase session
  payload.config.ts
```

## Content model

- **Courses** have a title, slug, summary, cover, language, level, tags, author and price mode. They support drafts and version history.
- **Modules** belong to a course. Drag them into order in the Modules list.
- **Lessons** belong to a module and can be dragged into order too. Each has a rich-text body with Code and Callout blocks, an optional Mux video, and a **Free preview** switch. The lesson's course is set automatically from its module, and its slug must be unique within that course.
- **Videos** (from the Mux plugin) upload straight from the browser to Mux.
- Through the public API, anyone can read published courses and lessons, but a lesson's body and video are only readable when it is a free preview.

## Public pages

| Route | What it shows |
| --- | --- |
| `/` | Hero, latest six courses, how it works |
| `/courses` | Catalog with search (`?q=`) and language and level filters |
| `/courses/[slug]` | Course hero, facts, description, full outline with free previews marked, instructor, topics |
| `/courses/[slug]/[lesson]` | Mux player, lesson notes with highlighted code and callouts, outline sidebar, previous and next |
| `/search?q=` | Matching courses and lessons |
| `/login`, `/signup` | GitHub or email magic link sign in |
| `/onboarding` | New learners: profile (avatar, name, bio), then goals and experience |
| `/account` | Profile, edit links and sign out (signed-out learners go to `/login`, new ones to `/onboarding`) |

A lesson is open when it is marked **Free preview** or its course's price mode is **Free**. Every other lesson shows a locked panel; its notes and video never leave the server. Paid access is milestone 4.

`/sitemap.xml` and `/robots.txt` are generated from published content. Set `NEXT_PUBLIC_SERVER_URL` to the production URL so canonical links and the sitemap use it.

## Learner sign in (Supabase Auth)

Learners sign in with GitHub or a magic link; there are no passwords. Admins keep using their separate Payload login at `/admin`.

1. In Supabase, open **Authentication > URL Configuration**. Set **Site URL** to your production URL and add these to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://<your site>/auth/callback`
   - `https://*-<your-vercel-team>.vercel.app/auth/callback` for preview deploys
2. For GitHub, create an OAuth app at GitHub > Settings > Developer settings with the callback URL `https://qxafrrtbolqbfhvsyhcl.supabase.co/auth/v1/callback`, then paste its client ID and secret into **Authentication > Sign In / Providers > GitHub**.
3. Email magic links work out of the box with Supabase's built-in mailer, which is rate limited. Add your own SMTP (for example Resend) under **Authentication > Emails** before launch.

Without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` the site still runs; the sign-in buttons say that auth is not configured yet.

## Learner onboarding and profiles

After a learner signs in or confirms their email for the first time, `/auth/callback` and `/auth/confirm` send them to `/onboarding`:

1. **Profile**: avatar, display name (prefilled from GitHub when available) and an optional bio.
2. **Goals**: where they are now, what they want (pick any) and an optional note in their own words.
3. **Ready**: a summary, then on to wherever they were going.

Profiles live in Supabase (`public.profiles`), not Payload. Row Level Security lets a learner read and change only their own row. Avatars upload from the browser straight to the public `avatars` Storage bucket, cropped to a 512px square WebP, and a learner can only write inside their own `<user id>/` folder.

### Apply the database migration

The schema is in `supabase/migrations/`. Apply it once to your Supabase project:

```bash
npx supabase login
npx supabase link --project-ref qxafrrtbolqbfhvsyhcl
npx supabase db push
```

Or paste the migration file into the Supabase SQL editor and run it.

## Styling

Each component has a `.module.scss` next to it and starts with `@use 'tokens' as *;` to get the shared variables and mixins from `src/styles/_tokens.scss` (Next resolves `tokens` through `sassOptions.loadPaths`). Colours are CSS custom properties defined in `src/styles/globals.scss`. Fonts are Space Grotesk and JetBrains Mono, loaded with `next/font`.

## Video (Mux)

1. Create an access token in the Mux dashboard with Mux Video read and write, and set `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET`.
2. Add a webhook pointing at `https://<your site>/api/mux/webhook` and set `MUX_WEBHOOK_SIGNING_SECRET`.
3. In `/admin`, open **Videos**, upload a file, and attach the video to a lesson once it shows as ready.

## Database migrations

In development Payload syncs schema changes automatically. Before deploying a schema change, create a migration and commit it:

```bash
pnpm migrate:create <name>
```

In production, pending migrations run automatically when the server starts (`prodMigrations` in `payload.config.ts`). You can also run them by hand with `pnpm migrate`.

## Deploying to Vercel

Set these environment variables in the Vercel project (see `.env.example` for where to find each one):

- `DATABASE_URL`: Supabase **Session pooler** connection string
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_S3_*` for uploads to Supabase Storage (create a public bucket named `media` first)
- `NEXT_PUBLIC_SERVER_URL` (your production URL) and the `MUX_*` keys

## Useful scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server on port 3000 |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` / `pnpm typecheck` | ESLint and TypeScript checks |
| `pnpm test:int` / `pnpm test:e2e` | Integration and end-to-end tests |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after changing collections |
| `pnpm generate:importmap` | Regenerate the admin import map after adding admin components |

# Milan Student Network — Website + Admin CMS

React + Vite + Tailwind CSS + Supabase. Public marketing site with a hidden
admin dashboard for managing events, FAQs, and the homepage layout.

## Stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS v4
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Drag & drop:** dnd-kit
- **Deploy:** Vercel

## 1. Supabase project setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql). This creates:
   - `events` — `id, title, date, description, image_url, created_at`
   - `faqs` — `id, question, answer, reference_data, display_order, created_at`
   - `site_settings` — drives the homepage section order, enabled/disabled state, editable heading/body text, and background image per section
   - RLS policies: public (`anon`) can `SELECT` only; authenticated users can `INSERT`/`UPDATE`/`DELETE`
   - A public `site-assets` storage bucket for event images and section background images
3. Create your admin user(s) under **Authentication → Users → Add user**. There is no public sign-up page — anyone with a Supabase Auth account for this project is treated as an admin, so only create accounts for people who should have CMS access.
4. Copy your **Project URL** and **anon public key** from **Project Settings → API**.

## 2. Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

```bash
npm run dev
```

## 3. Project structure

```
src/
  components/        Public site UI (Navbar, Footer, Hero, ServicesSection, EventCard, FaqItem)
  pages/              Public routes (Home, Events, Faq, ServicePlaceholder)
  admin/              Admin-only: Login, ProtectedRoute, Dashboard shell
    components/       EventManager, FaqManager, LayoutManager (+ SortableSectionItem)
  context/            AuthContext (Supabase session)
  lib/                supabaseClient, useSiteSettings hook
supabase/
  schema.sql          Full DB schema + RLS + storage policies
```

## 4. Routes

| Route                  | Description                                  |
| ----------------------- | --------------------------------------------- |
| `/`                     | Landing page (Hero, What We Offer, Events preview, FAQ preview) — section order/content editable from admin |
| `/events`               | Full events list, fetched live from Supabase  |
| `/faq`                  | Full FAQ list, fetched live from Supabase     |
| `/services/:slug`       | Placeholder pages for Accommodation, Events & Activities, Premium Services — to be built out next |
| `/admin-portal/login`   | Admin sign-in                                 |
| `/admin-portal/events`  | Event manager (add/edit/delete)               |
| `/admin-portal/faqs`    | FAQ manager (add/edit/delete)                 |
| `/admin-portal/layout`  | Drag-and-drop homepage layout + section text + background images |

The admin portal is not linked from the public nav — it's reachable only by
navigating directly to `/admin-portal`, and every route under it is protected
by `ProtectedRoute`, which redirects to `/admin-portal/login` if there's no
active Supabase session.

## 5. Editing the homepage layout

From `/admin-portal/layout` you can:

- **Drag** sections (Hero, What We Offer, Events, FAQ) into any order — persisted to `site_settings.display_order`
- **Toggle** a section on/off
- **Edit** each section's heading/body text (this is where you write "what Milan Student Network is" for the Hero section)
- **Upload a background image** per section, stored in the `site-assets` Supabase Storage bucket

Changes save straight to Supabase, so the public homepage reflects them immediately on refresh.

## 6. Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Import the repo in [Vercel](https://vercel.com/new).
3. Framework preset: **Vite**.
4. Add environment variables in the Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. `vercel.json` includes the SPA rewrite so client-side routes (like `/admin-portal`) don't 404 on refresh.

## 7. Next steps

- Build out the three full service pages (`/services/accommodation`, `/services/events-activities`, `/services/premium-services`) — currently placeholders.

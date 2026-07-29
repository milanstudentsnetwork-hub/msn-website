-- Milan Student Network — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- ============================================================
-- 1. EVENTS TABLE
-- ============================================================
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  date        timestamptz not null,
  description text,
  image_url   text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 2. FAQS TABLE
-- ============================================================
create table if not exists public.faqs (
  id              uuid primary key default gen_random_uuid(),
  question        text not null,
  answer          text not null,
  reference_data  text,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 3. SITE_SETTINGS TABLE
-- Drives the drag-and-drop homepage layout + per-section
-- background images set from the admin dashboard.
-- ============================================================
create table if not exists public.site_settings (
  id                  uuid primary key default gen_random_uuid(),
  section_key         text unique not null, -- e.g. 'hero', 'services', 'events', 'faq'
  label               text not null,
  display_order       integer not null default 0,
  enabled             boolean not null default true,
  background_image_url text,
  content             jsonb not null default '{}'::jsonb, -- editable heading/body text per section
  updated_at          timestamptz not null default now()
);

-- Seed the four default homepage sections (only if empty).
insert into public.site_settings (section_key, label, display_order, enabled, content)
select * from (values
  ('hero',     'Hero / Intro',      0, true, '{"heading":"Welcome to the Milan Student Network","body":"Write a description of what Milan Student Network is here, from the admin dashboard."}'::jsonb),
  ('services', 'What We Offer',     1, true, '{"heading":"What We Offer","body":""}'::jsonb),
  ('events',   'Events Preview',    2, true, '{"heading":"Upcoming Events","body":""}'::jsonb),
  ('faq',      'FAQ Preview',       3, true, '{"heading":"Frequently Asked Questions","body":""}'::jsonb)
) as seed(section_key, label, display_order, enabled, content)
where not exists (select 1 from public.site_settings);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- Public (anon) can only read. Any authenticated user (i.e. an
-- admin you create manually in Supabase Auth) can write.
-- This project has no public sign-up flow, so "authenticated"
-- is equivalent to "admin".
-- ============================================================
alter table public.events enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;

-- events policies
drop policy if exists "Public can read events" on public.events;
create policy "Public can read events"
  on public.events for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert events" on public.events;
create policy "Admins can insert events"
  on public.events for insert
  to authenticated
  with check (true);

drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events"
  on public.events for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events"
  on public.events for delete
  to authenticated
  using (true);

-- faqs policies
drop policy if exists "Public can read faqs" on public.faqs;
create policy "Public can read faqs"
  on public.faqs for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert faqs" on public.faqs;
create policy "Admins can insert faqs"
  on public.faqs for insert
  to authenticated
  with check (true);

drop policy if exists "Admins can update faqs" on public.faqs;
create policy "Admins can update faqs"
  on public.faqs for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admins can delete faqs" on public.faqs;
create policy "Admins can delete faqs"
  on public.faqs for delete
  to authenticated
  using (true);

-- site_settings policies
drop policy if exists "Public can read site_settings" on public.site_settings;
create policy "Public can read site_settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert site_settings" on public.site_settings;
create policy "Admins can insert site_settings"
  on public.site_settings for insert
  to authenticated
  with check (true);

drop policy if exists "Admins can update site_settings" on public.site_settings;
create policy "Admins can update site_settings"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admins can delete site_settings" on public.site_settings;
create policy "Admins can delete site_settings"
  on public.site_settings for delete
  to authenticated
  using (true);

-- ============================================================
-- 5. STORAGE BUCKET for event images + section background images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public can read site-assets" on storage.objects;
create policy "Public can read site-assets"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-assets');

drop policy if exists "Admins can upload site-assets" on storage.objects;
create policy "Admins can upload site-assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-assets');

drop policy if exists "Admins can update site-assets" on storage.objects;
create policy "Admins can update site-assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-assets');

drop policy if exists "Admins can delete site-assets" on storage.objects;
create policy "Admins can delete site-assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-assets');

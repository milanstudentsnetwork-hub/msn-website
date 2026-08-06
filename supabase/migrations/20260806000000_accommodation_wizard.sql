-- Accommodation wizard: extends accommodation_listings with the full
-- "post a listing" field set, adds the "looking for accommodation" table,
-- and extends listing_status with post-publish outcomes. Idempotent —
-- safe to run more than once.

-- ============ extend listing_status ============
ALTER TYPE public.listing_status ADD VALUE IF NOT EXISTS 'matched';
ALTER TYPE public.listing_status ADD VALUE IF NOT EXISTS 'closed';

-- ============ extend accommodation_listings ============
ALTER TABLE public.accommodation_listings
  ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS available_now BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS long_term BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS contract_status TEXT NOT NULL DEFAULT 'yes',
  ADD COLUMN IF NOT EXISTS contract_notes TEXT,
  ADD COLUMN IF NOT EXISTS gender_preference TEXT NOT NULL DEFAULT 'no_preference',
  ADD COLUMN IF NOT EXISTS max_roommates TEXT NOT NULL DEFAULT '2',
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_modern BOOLEAN,
  ADD COLUMN IF NOT EXISTS additional_notes TEXT,
  ADD COLUMN IF NOT EXISTS rent_range TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS photo_consent BOOLEAN NOT NULL DEFAULT false;

-- ============ accommodation_requests ("looking for accommodation") ============
DO $$ BEGIN
  CREATE TYPE public.request_pipeline_status AS ENUM ('new', 'under_review', 'matched', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.accommodation_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  gender                TEXT NOT NULL,
  move_immediately      BOOLEAN NOT NULL DEFAULT false,
  stay_type             TEXT NOT NULL,
  date_from             DATE,
  date_until            DATE,
  needs_contract        BOOLEAN NOT NULL DEFAULT false,
  room_type             TEXT NOT NULL,
  budget_range          TEXT NOT NULL,
  max_roommates         TEXT NOT NULL,
  location_preferences  TEXT NOT NULL DEFAULT '',
  notes                 TEXT,
  status                public.request_pipeline_status NOT NULL DEFAULT 'new',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.accommodation_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accommodation_requests TO authenticated;
GRANT ALL ON public.accommodation_requests TO service_role;
ALTER TABLE public.accommodation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can submit a request" ON public.accommodation_requests;
CREATE POLICY "anyone can submit a request" ON public.accommodation_requests
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'new');

DROP POLICY IF EXISTS "admins manage accommodation requests" ON public.accommodation_requests;
CREATE POLICY "admins manage accommodation requests" ON public.accommodation_requests
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS accommodation_requests_updated_at ON public.accommodation_requests;
CREATE TRIGGER accommodation_requests_updated_at
  BEFORE UPDATE ON public.accommodation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ fix listing photo visibility ============
-- The original storage policy only let admins SELECT listing photos, which
-- means public visitors couldn't actually see them on published listings.
-- Photos should be publicly viewable once uploaded (same as the listing
-- itself becomes public once approved) — only writes need to stay gated.
DROP POLICY IF EXISTS "public reads listing photos" ON storage.objects;
CREATE POLICY "public reads listing photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'listing-uploads');

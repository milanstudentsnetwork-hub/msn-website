-- Lets admins mark a listing as MSN-verified (visited/checked by the team),
-- shown to visitors as a trust badge alongside the existing Featured flag.
ALTER TABLE public.accommodation_listings
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

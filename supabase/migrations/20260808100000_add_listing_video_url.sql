-- Lets landlords/students attach a YouTube video walkthrough alongside photos.
ALTER TABLE public.accommodation_listings
  ADD COLUMN IF NOT EXISTS video_url text NULL;

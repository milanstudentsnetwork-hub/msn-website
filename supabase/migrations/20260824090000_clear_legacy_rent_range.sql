-- The wizard now collects an exact monthly rent instead of a bucket range.
-- Existing listings still carry their old range label (e.g. "€550–€700"),
-- which the site prefers over the numeric price when both are set. Clear it
-- so every listing falls back to showing its numeric price.
--
-- Caveat: for listings created before this change, `price` was only stored
-- as the bucket's lower bound (e.g. "€550–€700" -> price = 550), not the
-- real rent — so the number shown after this runs is approximate and should
-- be corrected per-listing via the admin portal's Edit Listing price field.
UPDATE public.accommodation_listings
SET rent_range = ''
WHERE rent_range <> '';

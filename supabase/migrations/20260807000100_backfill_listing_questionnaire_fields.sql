-- The 6 original seed listings predate the "Post a listing" wizard's extra questions
-- (gender preference, contract status, roommates, availability, modern) and were left
-- at column defaults. Backfill realistic values so the new browse filters have real
-- data to filter against instead of everything colliding on the same defaults.

UPDATE public.accommodation_listings SET
  gender_preference = 'no_preference',
  max_roommates = '3',
  contract_status = 'yes',
  available_now = true,
  long_term = true,
  is_modern = true
WHERE title = 'Bright single room near Bocconi';

UPDATE public.accommodation_listings SET
  gender_preference = 'no_preference',
  max_roommates = '3',
  contract_status = 'explain',
  contract_notes = 'Subletting during an Erasmus exchange; the registered contract stays under the original tenants'' names.',
  available_now = true,
  long_term = false,
  is_modern = false
WHERE title = 'Sublet my room in Città Studi (Erasmus semester)';

UPDATE public.accommodation_listings SET
  gender_preference = 'no_preference',
  max_roommates = '2',
  contract_status = 'yes',
  available_now = true,
  long_term = true,
  is_modern = true
WHERE title = 'Modern studio in Isola';

UPDATE public.accommodation_listings SET
  gender_preference = 'no_preference',
  max_roommates = '3',
  contract_status = 'yes',
  available_now = true,
  long_term = true,
  is_modern = false
WHERE title = 'Spare room in friendly Navigli flatshare';

UPDATE public.accommodation_listings SET
  gender_preference = 'no_preference',
  max_roommates = '2',
  contract_status = 'yes',
  available_now = true,
  long_term = true,
  is_modern = true
WHERE title = 'Two-bedroom apartment in Lambrate';

UPDATE public.accommodation_listings SET
  gender_preference = 'no_preference',
  max_roommates = '3',
  contract_status = 'explain',
  contract_notes = 'Short-term sublet for about 3 months while I''m away on a work placement; no new registered contract needed.',
  available_now = true,
  long_term = false,
  is_modern = false
WHERE title = 'Short-term room in Porta Venezia (3 months)';

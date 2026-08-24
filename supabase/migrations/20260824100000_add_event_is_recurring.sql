-- Lets a single event row represent a weekly-repeating occurrence: when set,
-- the site rolls event_date forward to the next matching weekday instead of
-- letting the event fall into the past, so admins never have to re-create it.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false;

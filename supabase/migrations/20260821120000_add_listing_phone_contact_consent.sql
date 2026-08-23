-- Lets listers opt in to showing their phone/WhatsApp/Telegram contact
-- options publicly, instead of always exposing the number they submitted.
ALTER TABLE public.accommodation_listings
  ADD COLUMN IF NOT EXISTS phone_contact_consent BOOLEAN NOT NULL DEFAULT false;

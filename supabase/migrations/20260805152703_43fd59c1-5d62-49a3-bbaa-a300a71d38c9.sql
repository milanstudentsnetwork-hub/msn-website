-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ roles ============
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- ============ enums ============
CREATE TYPE public.content_status AS ENUM ('draft', 'published');
CREATE TYPE public.listing_source AS ENUM ('landlord', 'student_upload');
CREATE TYPE public.listing_status AS ENUM ('pending', 'approved', 'rejected', 'published');
CREATE TYPE public.request_status AS ENUM ('new', 'contacted', 'in_progress', 'awaiting_payment', 'paid', 'completed', 'cancelled');

-- ============ events ============
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'social',
  cover_image_url TEXT,
  rsvp_url TEXT,
  capacity INTEGER,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published events" ON public.events FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "admins manage events" ON public.events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ services ============
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'support',
  icon_key TEXT,
  image_url TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC(10,2),
  price_note TEXT,
  booking_url TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Request This Service',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published services" ON public.services FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ faqs ============
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status public.content_status NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "admins manage faqs" ON public.faqs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ accommodation ============
CREATE TABLE public.accommodation_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_source public.listing_source NOT NULL DEFAULT 'landlord',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_period TEXT NOT NULL DEFAULT 'month',
  neighborhood TEXT NOT NULL DEFAULT '',
  address_note TEXT,
  room_type TEXT NOT NULL DEFAULT 'private_room',
  available_from DATE,
  available_until DATE,
  bedrooms INTEGER,
  bathrooms INTEGER,
  size_sqm INTEGER,
  furnished BOOLEAN NOT NULL DEFAULT true,
  bills_included BOOLEAN NOT NULL DEFAULT false,
  students_only BOOLEAN NOT NULL DEFAULT false,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  contact_phone TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.accommodation_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accommodation_listings TO authenticated;
GRANT INSERT ON public.accommodation_listings TO anon;
GRANT ALL ON public.accommodation_listings TO service_role;
ALTER TABLE public.accommodation_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published listings" ON public.accommodation_listings FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "anyone can submit a listing" ON public.accommodation_listings FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending' AND is_featured = false);
CREATE POLICY "admins manage listings" ON public.accommodation_listings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER accommodation_updated_at BEFORE UPDATE ON public.accommodation_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ service requests ============
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL DEFAULT 'Custom request',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  university TEXT,
  preferred_date DATE,
  details TEXT NOT NULL DEFAULT '',
  notes TEXT,
  quoted_price NUMERIC(10,2),
  payment_url TEXT,
  status public.request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.service_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit a request" ON public.service_requests FOR INSERT TO anon, authenticated WITH CHECK (status = 'new' AND quoted_price IS NULL);
CREATE POLICY "admins manage requests" ON public.service_requests FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ contact messages ============
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send a message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (is_read = false);
CREATE POLICY "admins manage messages" ON public.contact_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ site settings ============
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.site_settings (key, value) VALUES
  ('hero_title', 'Your Home Away From Home in Milan.'),
  ('hero_subtitle', 'From finding a room to finding your people, Milan Students Network helps international students feel at home from day one.'),
  ('hero_cta_primary', 'Find Accommodation'),
  ('hero_cta_secondary', 'Explore Events'),
  ('contact_email', 'info@milan-sn.it'),
  ('contact_phone', '+39 000 000 0000'),
  ('whatsapp_url', 'https://wa.me/390000000000'),
  ('instagram_url', 'https://instagram.com/milanstudentsnetwork'),
  ('tiktok_url', ''),
  ('linkedin_url', '');

-- ============ demo content ============
INSERT INTO public.events (title, slug, description, event_date, start_time, location, category, price, is_featured, status) VALUES
  ('Welcome Aperitivo for New Students', 'welcome-aperitivo', 'Arrive alone, leave with friends. Drinks, snacks and a very friendly crowd of new arrivals in Navigli.', CURRENT_DATE + 12, '19:00', 'Navigli, Milan', 'welcome', 10, true, 'published'),
  ('Duomo & City Centre Walking Tour', 'duomo-walking-tour', 'A relaxed two-hour walk through the heart of Milan with a local student guide.', CURRENT_DATE + 20, '15:00', 'Piazza del Duomo', 'culture', 0, true, 'published'),
  ('International Students Football Sunday', 'football-sunday', 'Casual five-a-side. All levels welcome, boots optional, good mood required.', CURRENT_DATE + 26, '11:00', 'Parco Sempione', 'sports', 5, true, 'published'),
  ('Careers & Networking Evening', 'careers-networking-evening', 'Meet students, recent grads and local employers who hire international talent.', CURRENT_DATE + 34, '18:30', 'Porta Nuova', 'networking', 0, false, 'published'),
  ('Student Night at Isola', 'student-night-isola', 'Music, cheap drinks and a big group of people who also just moved here.', CURRENT_DATE + 40, '22:00', 'Isola, Milan', 'nightlife', 12, false, 'published'),
  ('September Welcome Week Kickoff', 'welcome-week-kickoff', 'The big opening party of last term''s welcome week.', CURRENT_DATE - 30, '18:00', 'Città Studi', 'welcome', 0, false, 'published');

INSERT INTO public.services (name, slug, short_description, full_description, category, icon_key, is_paid, price, cta_label, is_featured, sort_order, status) VALUES
  ('Accommodation Support', 'accommodation-support', 'We help you search, shortlist and check housing before you sign anything.', 'Tell us your budget and area, and we will send you verified options, join viewings with you and read the contract before you commit.', 'housing', 'home', true, 79, 'Request This Service', true, 1, 'published'),
  ('Airport Pickup & Arrival Support', 'airport-pickup', 'Someone friendly waiting for you at Malpensa, Linate or Bergamo.', 'We meet you at arrivals, help with luggage and get you to your address with a working plan for day one.', 'arrival', 'plane', true, 49, 'Book This Service', true, 2, 'published'),
  ('SIM Card & Mobile Setup', 'sim-card-setup', 'Get an Italian number and data plan on your first day.', 'We compare the student offers, come with you to the shop and make sure your number is active before we leave.', 'arrival', 'smartphone', false, NULL, 'Request This Service', true, 3, 'published'),
  ('Residence Permit Guidance', 'residence-permit', 'Step-by-step help with the permesso di soggiorno.', 'Document checklist, kit assembly, post office appointment and what to expect at the questura.', 'admin', 'file-text', true, 59, 'Request This Service', false, 4, 'published'),
  ('University & City Orientation', 'city-orientation', 'Learn how Milan actually works in one afternoon.', 'Transport cards, supermarkets, healthcare, safe areas, student discounts and the fastest route to your campus.', 'orientation', 'compass', false, NULL, 'Request This Service', false, 5, 'published'),
  ('Local Recommendations', 'local-recommendations', 'Where students actually eat, study, shop and go out.', 'A personal shortlist based on your neighbourhood, budget and interests.', 'orientation', 'map-pin', false, NULL, 'Request This Service', false, 6, 'published'),
  ('Moving & Settling-In Support', 'moving-support', 'Help with the boxes, the bureaucracy and the first grocery run.', 'Practical hands-on help on moving day plus a settling-in checklist for your first two weeks.', 'housing', 'package', true, 69, 'Book This Service', false, 7, 'published'),
  ('Custom Support Request', 'custom-support', 'Something else on your mind? Ask us.', 'Tell us what you need and we will tell you honestly whether we can help and what it would cost.', 'support', 'sparkles', false, NULL, 'Make a Custom Request', false, 8, 'published');

INSERT INTO public.faqs (question, answer, sort_order, status) VALUES
  ('How can I find accommodation in Milan?', 'Browse the listings on our Accommodation page, use the filters for your budget, neighbourhood and room type, then contact the lister directly. If you would rather have help, request our Accommodation Support service and we will search with you.', 1, 'published'),
  ('Can I list my room or apartment?', 'Yes. If you are a landlord, agency or property owner, use "List Your Property" on the Accommodation page. Our team reviews every submission before it goes live.', 2, 'published'),
  ('Can I upload my own accommodation if I am a student subletting?', 'Absolutely. Use "Share Your Room" on the Accommodation page. It is a shorter, student-to-student form for subletting while you are away or filling a spare room in a shared flat.', 3, 'published'),
  ('Are events open to everyone?', 'Yes. Every event is open to all students in Milan, and most people come alone the first time. That is completely normal here.', 4, 'published'),
  ('Is Milan Students Network only for international students?', 'We are built around international students, but local students are very welcome. The more mixed the group, the better the community.', 5, 'published'),
  ('How do I get support when I arrive?', 'Request an arrival service before you land, or message us on WhatsApp once you are here. Someone real will answer you.', 6, 'published'),
  ('Are there fees for services?', 'Some services are free, some are paid. Every service card shows the price clearly before you request anything.', 7, 'published'),
  ('How can I join the community?', 'Come to an event, follow us on social media, or send us a message from the About page. There is no membership fee.', 8, 'published'),
  ('How do I request a paid service?', 'Click "Book This Service" on the service you want and fill in the short form. We reply with the details and a secure payment link.', 9, 'published');

INSERT INTO public.accommodation_listings (listing_source, title, description, price, neighborhood, room_type, available_from, furnished, bills_included, students_only, amenities, contact_name, contact_email, is_featured, status) VALUES
  ('landlord', 'Bright single room near Bocconi', 'Sunny single room in a renovated flat, five minutes'' walk from Bocconi. Shared kitchen and living room with two other students.', 650, 'Porta Romana', 'private_room', CURRENT_DATE + 15, true, true, true, ARRAY['Wi-Fi','Washing machine','Desk'], 'Giulia R.', 'listings@milanstudentsnetwork.com', true, 'published'),
  ('student_upload', 'Sublet my room in Città Studi (Erasmus semester)', 'I am away on exchange from March and looking for someone lovely to take my room. Great flatmates, very quiet street.', 520, 'Città Studi', 'private_room', CURRENT_DATE + 30, true, false, true, ARRAY['Wi-Fi','Balcony','Bike storage'], 'Marco T.', 'listings@milanstudentsnetwork.com', true, 'published'),
  ('landlord', 'Modern studio in Isola', 'Compact self-contained studio with its own bathroom and kitchenette, two minutes from the metro.', 890, 'Isola', 'studio', CURRENT_DATE + 7, true, false, false, ARRAY['Wi-Fi','Air conditioning','Lift'], 'Milano Living', 'listings@milanstudentsnetwork.com', true, 'published'),
  ('student_upload', 'Spare room in friendly Navigli flatshare', 'Our third flatmate is graduating, so we have a room going. We cook together on Sundays. Come say hi.', 580, 'Navigli', 'shared_room', CURRENT_DATE + 21, true, true, true, ARRAY['Wi-Fi','Washing machine','Terrace'], 'Aisha K.', 'listings@milanstudentsnetwork.com', false, 'published'),
  ('landlord', 'Two-bedroom apartment in Lambrate', 'Whole apartment ideal for two students sharing. Recently repainted, close to Politecnico Lambrate.', 1150, 'Lambrate', 'apartment', CURRENT_DATE + 45, false, false, true, ARRAY['Wi-Fi','Dishwasher','Storage'], 'Rossi Immobiliare', 'listings@milanstudentsnetwork.com', false, 'published'),
  ('student_upload', 'Short-term room in Porta Venezia (3 months)', 'Available while I do a placement in Berlin. Perfect if you are arriving mid-semester and still searching.', 700, 'Porta Venezia', 'private_room', CURRENT_DATE + 10, true, true, true, ARRAY['Wi-Fi','Gym in building'], 'Elena V.', 'listings@milanstudentsnetwork.com', false, 'published');
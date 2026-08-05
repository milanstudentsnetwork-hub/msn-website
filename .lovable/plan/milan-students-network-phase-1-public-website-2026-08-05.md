# Milan Students Network — Phase 1: Public Website

A warm, animated, 3D-inspired site for international students in Milan. This phase delivers all six public pages, the full database foundation (so nothing needs rebuilding later), and both accommodation submission flows. The admin portal comes in Phase 2.

## Design direction

Before building, I'll show three rendered design directions so you can pick the look. All three share the locked brand basics:

- Deep navy, warm yellow/orange, coral/pink accents, cream backgrounds — all WCAG AA
- Rounded friendly display font for headlines, neutral font for body
- Soft, volumetric, toy-like illustration style (original artwork, generated for this project)

Motion is core, not decoration: parallax hero layers, idle loops on characters and objects, scroll-triggered entrances, hover lift/tilt on cards, squash-on-click buttons, animated accordions and carousels, and a tram-themed loading state. Built with Motion for React plus CSS/SVG animation, with a full `prefers-reduced-motion` fallback that keeps the warmth without the movement.

## Pages in this phase

1. **Home** — hero with animated Milan arrival scene, "How We Help" cards, "Why MSN", featured events carousel, featured services, featured accommodation preview, closing CTA
2. **Accommodation** — search/filters, animated listing cards, illustrated neighborhood map section, how-we-help + safety tips, and two clearly separate submission entry points
3. **Events** — filters by category, animated event cards, scroll-animated timeline, upcoming + past archive, "suggest an event" section
4. **Services** — service cards with animated icons, request/book buttons, "Need something specific?" custom request
5. **FAQ** — illustrated animated accordion
6. **About & Contact** — brand story, values, contact form, contact details, social links, community illustration

Header nav: Home | Accommodation | Events | Services | FAQ | About Us, plus a persistent "Join the Network" button. Footer carries a discreet admin-access icon bottom-right (links to the login page built in Phase 2).

## Backend foundation (built now)

Lovable Cloud provides the database, auth, and storage.

Tables created in this phase, with row-level security so the public only ever reads approved/published rows:

- `events` — title, description, date, time, location, category, cover image, RSVP link, capacity, price, featured, status
- `services` — name, short/full description, price, is_paid, booking link, category, image, featured, sort order, status
- `faqs` — question, answer, sort order, status
- `accommodation_listings` — title, description, price, neighborhood, room_type, availability, images, contact details, status (pending/approved/rejected/published), and **`listing_source`** (`landlord` | `student_upload`)
- `service_requests` — name, email, phone/WhatsApp, university, preferred date, service, details, notes, status (New → Contacted → In Progress → Awaiting Payment → Paid → Completed → Cancelled)
- `contact_messages` — from the About/Contact form
- `site_settings` — hero text, CTA labels, contact info, social links
- `user_roles` — separate admin role table (security best practice), used by Phase 2

Storage buckets for listing photos and admin-uploaded images.

The two accommodation forms are built as **separate components with separate submit handlers**, both writing to `accommodation_listings` with different `listing_source` values — so student uploads can later be split to their own table or workflow as a routing change, not a rewrite.

## Payments

Paid services use admin-provided booking/payment links for now (no checkout integration). Free services go straight to the request form.

## Phase 2 (after this is approved and built)

Invite-only email/password admin portal at a hidden route: dashboard plus full CRUD for events, services, FAQs, accommodation review queue (with Landlord/Agency vs Student Upload badges and filters), service request pipeline, and homepage/content controls. Public pages already read from the database, so published changes appear instantly.

## Technical notes

- TanStack Start + Tailwind, Motion for React, semantic design tokens in `src/styles.css` (no hardcoded colors)
- Public reads via anon-safe policies; submissions validated with Zod client- and server-side
- Per-route SEO metadata targeting international students in Milan; semantic headings, alt text, ARIA labels, keyboard nav
- Below-the-fold illustrated scenes lazy-loaded; images optimized

## GitHub

Connecting `msn-website.git` is done from the Lovable UI (Plus menu → GitHub → Connect project), not by me. Once connected, every change syncs automatically. Note that Lovable creates the repo rather than importing an existing one, so you may need to point it at a fresh repo and copy over anything already in yours.

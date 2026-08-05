# Milan Connect

# Milan Students Network — Full Website Redesign Prompt
*(Ready to paste into Lovable, Kimi AI, or a similar AI website builder)*

---

## 1. Project Overview

Build a complete redesign of **Milan Students Network**, a welcoming community and support platform for international students moving to or living in Milan.

**Brand message:**
"Milan Students Network is your home away from home in Milan."

**Personality:** warm, youthful, friendly, trustworthy, inclusive, exciting — never corporate.

The site should help international students settle into Milan: find accommodation, discover helpful services, meet people, join events, and get local support.

---

## 2. Visual & Motion Direction — Fully Animated, 3D-Inspired

This is not a mostly-static site with a few accents. **Motion and dimensionality are core to the identity**, not decoration. Build it as a living, breathing interface:

- **3D-inspired illustration style throughout**: soft, rounded, toy-like/claymation-adjacent shapes (think friendly volumetric characters and objects with gentle shading, depth, and soft shadows) rather than flat vector art. Apply this style consistently to hero art, icons, empty states, and section dividers — not just the homepage.
- **Everything moves with purpose**: illustrated characters idle-animate (blinking, swaying, waving), objects have subtle floating/bobbing loops (suitcases, keys, coffee cups, trams), and section backgrounds have slow parallax depth as the user scrolls.
- **Micro-interactions everywhere**: buttons squash/bounce slightly on click, cards lift and tilt gently on hover, icons morph or wiggle on hover, form fields animate focus states, checkmarks/success states play a small celebratory animation.
- **Scroll-driven storytelling**: as the user scrolls the homepage, illustrated elements should animate into place (fade+rise, draw-on paths for tram lines/city map routes, staggered card entrances) rather than just appearing.
- **Animated transitions between pages/states**: smooth page transitions, animated loading states (e.g., a small looping character or tram instead of a plain spinner), and animated modal/drawer open-close.
- **Technical approach**: use CSS/SVG animation and a motion library (e.g., Framer Motion or GSAP if the platform supports it) for interactions; use Lottie or animated SVG for character/scene animation where possible so it stays lightweight. Respect `prefers-reduced-motion` and provide a reduced-motion fallback that keeps the design warm without the movement.
- Do **not** copy any existing animation studio's characters, visual assets, or exact style — this must be an original, whimsical, high-quality cartoon/3D visual language unique to Milan Students Network.

**Color palette (Milan-inspired, vibrant but accessible):**
- Deep navy / midnight blue — trust
- Warm yellow / orange — optimism
- Coral / pink accents — energy
- Cream / off-white backgrounds
- All combinations must meet WCAG AA contrast for text

**Typography:** clean, modern, highly readable, with a friendly rounded display font for headlines and a neutral workhorse font for body text.

**Overall UX bar:** responsive, mobile-first, fast-loading despite the animation (lazy-load below-the-fold scenes, optimize assets), easy to navigate, accessible (keyboard nav, alt text, ARIA labels, reduced-motion support).

---

## 3. Public Website Pages

### 3.1 Home Page

**Hero section**
- Headline: "Your Home Away From Home in Milan."
- Subtext: "From finding a room to finding your people, Milan Students Network helps international students feel at home from day one."
- Primary CTA: "Find Accommodation"
- Secondary CTA: "Explore Events"
- Animated 3D-style hero scene: newly arrived students exploring Milan with luggage, a tram passing by, apartment keys spinning/glinting, a steaming coffee cup, and general friendly city energy — built as a layered, gently animated illustration (parallax + idle loops), not a static image.

**"How We Help" section** — animated cards, each with its own small looping icon-animation:
- Find accommodation
- Discover student-friendly services
- Meet people through events
- Get answers and local support

**"Why Milan Students Network?" section**
- Made for international students
- A trusted student community
- Local support, real people, real experiences

**Featured upcoming-events carousel** — auto-pulled from published featured events in the admin portal; cards animate in with a staggered entrance and smooth drag/swipe carousel motion.

**Featured-services section** — auto-pulled from services marked "featured" in the admin portal.

**Featured-accommodation preview section** — displays only approved and published accommodation listings.

**Closing CTA**
"Ready to make Milan feel like home?"
Buttons: "Join the Network" / "Contact Us"

---

### 3.2 Accommodation Page

**Purpose:** help students find rooms, apartments, sublets, and housing opportunities in Milan.

Include:
- Search and filter interface (location, price, room type, availability, student preference)
- Illustrated, animated listing cards with image, price, neighborhood, availability, room type, and quick details; cards lift/tilt on hover
- A map-inspired illustrated section showing Milan neighborhoods, with animated pins/markers
- A section explaining how Milan Students Network helps students find housing
- Trust and safety tips for accommodation searching
- **Two distinct listing-submission entry points**, each visually distinct so users immediately understand which one applies to them:

  1. **"List Your Property"** — for landlords, agencies, and property owners with an apartment, room, or sublet to rent out. Opens the existing property-listing form (location, price, room type, availability, images, contact details, etc.), which submits to the admin portal for review and only appears publicly after approval and publishing.

  2. **"Upload Your Accommodation" / "Share Your Room"** *(new)* — a second, student-facing entry point aimed at students who already have a room/flat in Milan and want to list it (e.g., subletting while away, or listing a spare room in a shared flat). This button should be visually and contextually separate from "List Your Property" (different card, different copy tone — more casual/peer-to-peer) so it's clear this is a student-to-student option, not a landlord/agency one.
     - **Functional placeholder for now:** clicking this button opens a short-form submission flow collecting the same core details (title, description, price, neighborhood, room type, availability, photos, contact info) plus a field indicating the submission type/source (e.g., `listing_source: student_upload` vs `listing_source: landlord`).
     - **Build this so the submission is tagged/flagged by source from day one**, even though for now both flows can write to the same underlying listings table. The intent is that this can later be split into its own table, its own approval workflow, or its own review queue in the admin portal without needing to rebuild the form — so structure the data model with a `source` or `listing_type` field and keep the submission logic modular/separated in code, ready to be redirected to a dedicated backend path later.
     - Until that separation happens, these submissions should still land in the same admin "Accommodation" review queue as landlord listings, just visibly labeled with their source (e.g., a small badge: "Student Upload" vs "Landlord/Agency") so admins can tell them apart at a glance.

---

### 3.3 Events Page

**Purpose:** showcase social events, welcome events, parties, city tours, networking evenings, sports activities, cultural activities, and student meetups.

Include:
- Hero title: "Meet Your People in Milan"
- Supporting copy welcoming students even if they're arriving alone
- Event cards: image, title, date, time, location, category, short description, price if applicable, RSVP button — with playful hover/entrance animation
- Filters: social, nightlife, culture, networking, sports, welcome events
- An animated event calendar or timeline (e.g., a small tram or character moving along a timeline as you scroll/filter)
- A section inviting students to suggest or host an event
- Upcoming events and a past-events archive

Events are fully managed from the admin portal. Published events automatically appear on the Events page and, if marked featured, on the homepage carousel. Expired events automatically move to the past-events archive or are hidden.

---

### 3.4 Services Page

**Purpose:** show student-focused services that make moving to and living in Milan easier.

Service cards to include:
- Accommodation support
- Airport pickup / arrival support
- SIM card / mobile setup help
- Residence permit guidance
- University and city orientation
- Local recommendations
- Moving and settling-in support
- Custom support requests

Each card includes: service name, icon/cover image (animated on hover), short description, price if applicable, and a "Request This Service" / "Book This Service" button.

**"Need something specific?" section**
"Tell us what you need, and we will help you find the right solution."
Button: "Make a Custom Request"

Paid services should support a payment or booking link/checkout flow; free services skip straight to a request form.

---

### 3.5 FAQ Page

Friendly, illustrated FAQ page with animated expandable accordion items (smooth expand/collapse, small icon animation on open).

Example questions:
- How can I find accommodation in Milan?
- Can I list my room or apartment?
- Can I upload my own accommodation if I'm a student subletting?
- Are events open to everyone?
- Is Milan Students Network only for international students?
- How do I get support when I arrive?
- Are there fees for services?
- How can I join the community?
- How do I request a paid service?

Fully manageable from the admin portal: create, edit, reorder, publish, unpublish, delete. Published FAQs auto-appear on the public page.

---

### 3.6 About & Contact Page

Brand story:
"We know moving to a new city can feel overwhelming. We created Milan Students Network so no student has to figure out Milan alone."

Include:
- Brand story and community values
- Contact form
- Email address
- Phone/WhatsApp contact
- Social media links
- A cheerful, animated illustrated community/team visual
- CTA to join the network

---

## 4. Navigation

Home | Accommodation | Events | Services | FAQ | About Us

Include a prominent "Join the Network" button in the header at all times.

**Tone of voice:** friendly, supportive, modern, inclusive, conversational, clear, student-focused. Simple English for an international audience. Avoid formal/corporate language.

---

## 5. Admin Portal & Backend

Secure admin portal with authentication, **not** in the main navigation. Add a small, discreet admin-access icon in the bottom-right of the footer — subtle to normal users, findable by staff. Clicking it opens a secure admin login page.

Admin dashboard: clean, practical, modern, easy for non-technical staff on desktop and mobile.

Use a real, persistent database. Public pages only ever display content that is approved and published by admins.

### 5.1 Events Management
- Create, edit, duplicate, publish, unpublish, delete events
- Fields: title, description, date, time, location, category, cover image, RSVP/ticket link, capacity, price
- Mark as featured/upcoming; view/manage status
- Published events auto-display on the frontend
- Expired events auto-move to past-events archive or hide

### 5.2 Services Management
- Create, edit, reorder, publish, unpublish, delete services
- Fields: name, short description, full description, price, category, image/icon, CTA button
- Free vs. paid toggle; booking/payment links for paid services
- Mark as featured for homepage
- Published services auto-display on the Services page

### 5.3 FAQ Management
- Create, edit, reorder, publish, unpublish, delete FAQs
- Question/answer fields
- Published FAQs auto-display as accordion items

### 5.4 Accommodation Management
- Review submitted property/sublet listings
- Approve, reject, edit, publish, unpublish, delete
- Manage images, title, description, price, neighborhood, room type, availability, property details, contact details
- **Distinguish listing source at a glance**: each listing shows a badge/tag indicating whether it came from the "List Your Property" (landlord/agency) flow or the "Upload Your Accommodation" (student) flow, using the `listing_source`/`listing_type` field from submission.
- **Placeholder note for future build-out:** the review queue is unified for now, but the data model and submission logic should be built so student-uploaded listings can later be routed to a separate table, a separate moderation workflow, or even a separate page/section entirely — without reworking the public-facing forms.
- Only approved and published listings display publicly, regardless of source

### 5.5 Service Requests & Paid-Service Management

Request form (submitted from any service page/card) collects:
- Full name
- Email address
- Phone number/WhatsApp
- University
- Preferred date (if relevant)
- Selected service
- Request details
- Additional notes

Admins manage all incoming requests in the dashboard with statuses:
New → Contacted → In Progress → Awaiting Payment → Paid → Completed → Cancelled

For paid services: admins set price, connect requests to a secure payment/checkout link, and the site shows a clear confirmation message after a request or payment is submitted.

### 5.6 General Content Controls
- Edit homepage hero text and CTA labels
- Choose featured events, services, and accommodation listings
- Update contact info and social links
- Upload/manage images site-wide

---

## 6. Technical & UX Requirements

- Secure authentication for admin users
- Real database and persistent storage for content/images
- Frontend updates automatically when admins publish changes
- Form validation with friendly success/error messages
- Confirmation safeguards before deleting content
- All forms fully responsive and easy to complete on mobile
- Frontend stays playful, animated, 3D-inspired, and visually memorable at all times — this is a defining feature, not an optional layer
- Admin dashboard stays clean, efficient, professional (minimal animation there — clarity over flair)
- SEO-friendly headings, metadata, and page structure targeting international students in Milan
- Respect `prefers-reduced-motion` for accessibility

---

## 7. Data Model Note for the Builder (Accommodation Source Split)

When implementing the accommodation submission flow, please structure it as follows so the two entry points can diverge later without a rebuild:

- Single `accommodation_listings` table for now, with a `listing_source` field (values: `landlord`, `student_upload`)
- Shared core fields (title, description, price, neighborhood, room_type, availability, images, contact_details, status: pending/approved/rejected/published)
- Keep the two frontend submission forms and their handlers as **separate components/functions** even though they currently write to the same table, so that redirecting `student_upload` submissions to a new table or workflow later is a routing change, not a rewrite
- Admin UI should filter/badge by `listing_source` from the start

---

*End of prompt — paste this directly into your AI website builder of choice.*

https://github.com/milanstudentsnetwork-hub/msn-website.git push it here

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9c9eeb85-b53e-46a7-b99d-fee0f5f8838f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

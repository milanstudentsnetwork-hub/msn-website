import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Send, ShieldAlert, X } from "lucide-react";
import { listingsQuery, siteSettingsQuery } from "@/lib/queries";
import { ListingCard } from "@/components/site/ListingCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { AccommodationWizard } from "@/components/accommodation/AccommodationWizard";
import { ListingsMap, type LatLng } from "@/components/accommodation/ListingsMap";
import { motion } from "motion/react";
import { Reveal, Float, staggerParent, staggerChild } from "@/components/motion/Motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GENDER_PREFERENCES, ROOMMATES, CONTRACT_STATUSES } from "@/lib/accommodation-options";
import { distanceKm } from "@/lib/geo";
import milanMap from "@/assets/milan-map.jpg";

const YES_NO_FILTERS = [
  { value: "all", label: "Any" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const DEFAULT_RADIUS_KM = 3;

export const Route = createFileRoute("/accommodation/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(listingsQuery),
      context.queryClient.ensureQueryData(siteSettingsQuery),
    ]),
  head: () => ({
    meta: [
      { title: "Student Accommodation in Milan | Milan Students Network" },
      {
        name: "description",
        content:
          "Hand-reviewed rooms and flats for international students in Milan, plus safety tips and two ways to submit your own listing.",
      },
      { property: "og:title", content: "Student Accommodation in Milan" },
      {
        property: "og:description",
        content: "Hand-reviewed rooms for international students, with safety guidance built in.",
      },
    ],
  }),
  component: AccommodationPage,
});

const safetyTips = [
  "Never pay a deposit before you (or a friend) have seen the place in person or on live video.",
  "A real contract is registered with the Agenzia delle Entrate. Ask for it — always.",
  "If the price is far below the neighbourhood average, treat it as a warning, not a win.",
  "Send money by bank transfer only. No crypto, no gift cards, no Western Union.",
];

/** Convert a snake_case DB value like "private_room" to "Private Room" */
function formatLabel(value: string) {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Upper bound of each budget bucket collected by the listing wizard. A listing only
// reliably fits under a given max-price filter if its whole bucket is at or below it —
// "More than €850" has no upper bound, so it only ever matches the uncapped filter.
const RENT_BUCKET_MAX: Record<string, number> = {
  "Less than €400": 400,
  "€400–€550": 550,
  "€550–€700": 700,
  "€700–€850": 850,
  "More than €850": Infinity,
};
const PRICE_SLIDER_MAX = 2000;

/** Listings from the wizard only store an approximate bucket lower-bound in `price`;
 * use the bucket's upper bound instead so the filter doesn't under-count expensive listings.
 * Legacy/admin listings without a bucket keep their real numeric `price`. */
function effectiveMaxPrice(listing: { price: number; rent_range: string }) {
  return RENT_BUCKET_MAX[listing.rent_range] ?? listing.price;
}

function AccommodationPage() {
  const { data: listings } = useSuspenseQuery(listingsQuery);
  const { data: settings } = useSuspenseQuery(siteSettingsQuery);
  const telegramAccommodationUrl = settings["telegram_accommodation_url"];
  const whatsappAccommodationUrl = settings["whatsapp_accommodation_url"];
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [roomType, setRoomType] = useState("all");
  const [genderPref, setGenderPref] = useState("all");
  const [maxRoommates, setMaxRoommates] = useState("all");
  const [contractStatus, setContractStatus] = useState("all");
  const [availableNow, setAvailableNow] = useState("all");
  const [longTerm, setLongTerm] = useState("all");
  const [isModern, setIsModern] = useState("all");
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);

  const roomTypes = useMemo(
    () => ["all", ...Array.from(new Set(listings.map((l) => l.room_type)))],
    [listings],
  );

  const filtered = listings.filter((listing) => {
    const haystack =
      `${listing.title} ${listing.neighborhood} ${listing.description}`.toLowerCase();
    const priceLimit = maxPrice >= PRICE_SLIDER_MAX ? Infinity : maxPrice;
    const withinArea =
      !mapCenter ||
      (listing.latitude != null &&
        listing.longitude != null &&
        distanceKm(mapCenter.lat, mapCenter.lng, listing.latitude, listing.longitude) <= radiusKm);
    return (
      haystack.includes(query.toLowerCase()) &&
      effectiveMaxPrice(listing) <= priceLimit &&
      (roomType === "all" || listing.room_type === roomType) &&
      // A listing marked "no preference" welcomes any gender, so it should match every choice.
      (genderPref === "all" ||
        listing.gender_preference === genderPref ||
        listing.gender_preference === "no_preference") &&
      (maxRoommates === "all" || listing.max_roommates === maxRoommates) &&
      (contractStatus === "all" || listing.contract_status === contractStatus) &&
      (availableNow === "all" || listing.available_now === (availableNow === "yes")) &&
      (longTerm === "all" || listing.long_term === (longTerm === "yes")) &&
      // is_modern is nullable — NULL means "we don't know," so don't penalize the listing for it.
      (isModern === "all" ||
        listing.is_modern == null ||
        listing.is_modern === (isModern === "yes")) &&
      withinArea
    );
  });

  function resetFilters() {
    setQuery("");
    setMaxPrice(PRICE_SLIDER_MAX);
    setRoomType("all");
    setGenderPref("all");
    setMaxRoommates("all");
    setContractStatus("all");
    setAvailableNow("all");
    setLongTerm("all");
    setIsModern("all");
    setMapCenter(null);
    setRadiusKm(DEFAULT_RADIUS_KM);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <SectionHeading
        eyebrow="Accommodation"
        title="A room that feels like a landing pad"
        description="Every listing below has been read by a human on our team. No bots, no ghost flats."
      />

      <Reveal className="mt-10 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Navigli, near Bocconi, sunny…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-type">Room type</Label>
            <select
              id="room-type"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm capitalize shadow-sm"
            >
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All" : formatLabel(type)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">
              {maxPrice >= PRICE_SLIDER_MAX ? "Any budget" : `Max €${maxPrice}/month`}
            </Label>
            <input
              id="price"
              type="range"
              min={200}
              max={PRICE_SLIDER_MAX}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="h-9 w-full accent-[var(--coral)]"
            />
          </div>
        </div>

        {/* Mirrors every question the "Post a listing" wizard asks, so students can filter on it. */}
        <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-1.5">
            <Label htmlFor="gender-pref">Gender preference</Label>
            <select
              id="gender-pref"
              value={genderPref}
              onChange={(e) => setGenderPref(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              <option value="all">Any</option>
              {GENDER_PREFERENCES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roommates">Max sharing bathroom/kitchen</Label>
            <select
              id="roommates"
              value={maxRoommates}
              onChange={(e) => setMaxRoommates(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              <option value="all">Any</option>
              {ROOMMATES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contract">Registered contract</Label>
            <select
              id="contract"
              value={contractStatus}
              onChange={(e) => setContractStatus(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              <option value="all">Any</option>
              {CONTRACT_STATUSES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="available-now">Available now</Label>
            <select
              id="available-now"
              value={availableNow}
              onChange={(e) => setAvailableNow(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              {YES_NO_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="long-term">Long-term stay</Label>
            <select
              id="long-term"
              value={longTerm}
              onChange={(e) => setLongTerm(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              {YES_NO_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="modern">Modern</Label>
            <select
              id="modern"
              value={isModern}
              onChange={(e) => setIsModern(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            >
              {YES_NO_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="size-4" /> Reset all filters
          </Button>
        </div>
      </Reveal>

      <Reveal className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold">Search by area</h3>
            <p className="text-sm text-muted-foreground">
              Click the map to drop a pin, then set a radius to only see listings nearby.
            </p>
          </div>
          {mapCenter && (
            <Button variant="outline" size="sm" onClick={() => setMapCenter(null)}>
              <X className="size-4" /> Clear area
            </Button>
          )}
        </div>
        {mapCenter && (
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="radius">Radius: {radiusKm} km</Label>
            <input
              id="radius"
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="h-9 w-full accent-[var(--coral)]"
            />
          </div>
        )}
        <div className="mt-4">
          <ListingsMap
            listings={listings}
            center={mapCenter}
            radiusKm={radiusKm}
            onCenterChange={setMapCenter}
          />
        </div>
      </Reveal>

      {/* Animate in on mount rather than on scroll-into-view: this list re-filters and
          re-mounts constantly, and a viewport-triggered reveal can leave late-mounting
          cards permanently invisible once the parent's one-time trigger has already fired. */}
      <motion.div
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {filtered.map((listing) => (
          <motion.div key={listing.id} variants={staggerChild} className="h-full">
            <ListingCard listing={listing} />
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">
          No rooms match those filters yet. Try widening your budget.
        </p>
      )}

      {(telegramAccommodationUrl || whatsappAccommodationUrl) && (
        <Reveal className="mt-10 rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
          <p className="font-display font-semibold">Want new rooms the moment they're posted?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Join our accommodation group for real-time listings.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {telegramAccommodationUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={telegramAccommodationUrl} target="_blank" rel="noreferrer">
                  <Send className="size-4" /> Telegram
                </a>
              </Button>
            )}
            {whatsappAccommodationUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={whatsappAccommodationUrl} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        </Reveal>
      )}

      <section className="mt-24 grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <Float distance={-10} duration={8}>
            <img
              src={milanMap}
              alt="Illustrated map of Milan neighbourhoods"
              loading="lazy"
              width={1200}
              height={848}
              className="w-full rounded-[2.5rem] shadow-lift"
            />
          </Float>
        </Reveal>
        <div>
          <SectionHeading
            eyebrow="Know your neighbourhoods"
            title="Where students actually live"
            description="Città Studi for engineers, Navigli for nightlife, Bicocca for cheaper rent, Lambrate for creatives. Ask us and we'll tell you the honest version."
          />
        </div>
      </section>

      <section className="mt-24 rounded-[2.5rem] bg-primary p-8 text-primary-foreground sm:p-12">
        <h2 className="inline-flex items-center gap-3 font-display text-2xl font-semibold">
          <ShieldAlert className="size-6 text-secondary" />
          Stay safe while you search
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {safetyTips.map((tip) => (
            <li
              key={tip}
              className="rounded-2xl bg-primary-foreground/10 p-5 text-sm text-primary-foreground/90"
            >
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section id="find-or-list" className="mt-24 scroll-mt-28">
        <SectionHeading
          eyebrow="Get started"
          title="Find or List Accommodation"
          description="Tell us what you need and we will help you find the right match."
          align="center"
        />
        <div className="mx-auto mt-10 max-w-2xl">
          <AccommodationWizard />
        </div>
      </section>
    </div>
  );
}

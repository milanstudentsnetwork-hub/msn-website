import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Send, ShieldAlert } from "lucide-react";
import { listingsQuery, siteSettingsQuery } from "@/lib/queries";
import { ListingCard } from "@/components/site/ListingCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { AccommodationWizard } from "@/components/accommodation/AccommodationWizard";
import { Reveal, StaggerGroup, StaggerItem, Float } from "@/components/motion/Motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import milanMap from "@/assets/milan-map.jpg";

export const Route = createFileRoute("/accommodation")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(listingsQuery),
      context.queryClient.ensureQueryData(siteSettingsQuery),
    ]),
  head: () => ({
    meta: [
      { title: "Student Accommodation in Milan | Milan Students Network" },
      { name: "description", content: "Hand-reviewed rooms and flats for international students in Milan, plus safety tips and two ways to submit your own listing." },
      { property: "og:title", content: "Student Accommodation in Milan" },
      { property: "og:description", content: "Hand-reviewed rooms for international students, with safety guidance built in." },
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

function AccommodationPage() {
  const { data: listings } = useSuspenseQuery(listingsQuery);
  const { data: settings } = useSuspenseQuery(siteSettingsQuery);
  const telegramAccommodationUrl = settings["telegram_accommodation_url"];
  const whatsappAccommodationUrl = settings["whatsapp_accommodation_url"];
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [roomType, setRoomType] = useState("all");

  const roomTypes = useMemo(
    () => ["all", ...Array.from(new Set(listings.map((l) => l.room_type)))],
    [listings],
  );

  const filtered = listings.filter((listing) => {
    const haystack = `${listing.title} ${listing.neighborhood} ${listing.description}`.toLowerCase();
    return (
      haystack.includes(query.toLowerCase()) &&
      listing.price <= maxPrice &&
      (roomType === "all" || listing.room_type === roomType)
    );
  });

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
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Max €{maxPrice}/month</Label>
            <input
              id="price"
              type="range"
              min={200}
              max={2000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="h-9 w-full accent-[var(--coral)]"
            />
          </div>
        </div>
      </Reveal>

      <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((listing) => (
          <StaggerItem key={listing.id} className="h-full">
            <ListingCard listing={listing} />
          </StaggerItem>
        ))}
      </StaggerGroup>

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

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BadgeCheck,
  BedDouble,
  Bath,
  Euro,
  Home,
  MapPin,
  Ruler,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowLeft,
} from "lucide-react";
import { listingQuery } from "@/lib/queries";
import { Reveal } from "@/components/motion/Motion";
import { buttonVariants } from "@/components/ui/button";
import { EnquireButton } from "@/components/site/EnquireButton";
import { GENDER_PREFERENCES, CONTRACT_STATUSES } from "@/lib/accommodation-options";
import { cn } from "@/lib/utils";
import roomPlaceholder from "@/assets/room-placeholder.jpg";

const SITE_URL = "https://milan-sn.it";

/** Convert a snake_case DB value like "private_room" to "Private Room" */
function formatLabel(value: string) {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Turn a youtube.com/watch or youtu.be link into an embeddable player URL. */
function youtubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export const Route = createFileRoute("/accommodation/$id")({
  loader: async ({ context, params }) => {
    const listing = await context.queryClient.ensureQueryData(listingQuery(params.id));
    if (!listing) throw notFound();
    return listing;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const title = `${loaderData.title} | Milan Students Network`;
    const description = loaderData.description.slice(0, 160);
    const url = `${SITE_URL}/accommodation/${loaderData.id}`;
    const image = loaderData.images?.[0];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  component: ListingDetailPage,
});

function ListingDetailPage() {
  const { id } = Route.useParams();
  const { data: listing } = useSuspenseQuery(listingQuery(id));
  const [activeIndex, setActiveIndex] = useState(0);

  if (!listing) return null;

  const photos = listing.images && listing.images.length > 0 ? listing.images : [roomPlaceholder];
  const priceLabel = listing.rent_range || `€${listing.price}/${listing.price_period}`;
  const genderLabel = GENDER_PREFERENCES.find((g) => g.value === listing.gender_preference)?.label;
  const contractLabel = CONTRACT_STATUSES.find((c) => c.value === listing.contract_status)?.label;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Link
        to="/accommodation"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to all listings
      </Link>

      <Reveal className="mt-6 grid gap-10 lg:grid-cols-[3fr_2fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
            <img
              src={photos[activeIndex]}
              alt={`${listing.title} — photo ${activeIndex + 1}`}
              className="size-full object-cover"
            />
          </div>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    index === activeIndex
                      ? "border-accent"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={photo} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">
              {formatLabel(listing.room_type)}
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-balance">
              {listing.title}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4 text-accent" />
              {listing.neighborhood}
            </p>

            <p className="mt-6 whitespace-pre-line text-muted-foreground">{listing.description}</p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.bedrooms != null && (
                <DetailStat
                  icon={BedDouble}
                  label={`${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}`}
                />
              )}
              {listing.bathrooms != null && (
                <DetailStat
                  icon={Bath}
                  label={`${listing.bathrooms} bathroom${listing.bathrooms === 1 ? "" : "s"}`}
                />
              )}
              {listing.size_sqm != null && (
                <DetailStat icon={Ruler} label={`${listing.size_sqm} m²`} />
              )}
              <DetailStat icon={Users} label={`Up to ${listing.max_roommates} sharing`} />
              {listing.furnished && <DetailStat icon={Home} label="Furnished" />}
              {listing.bills_included && <DetailStat icon={ShieldCheck} label="Bills included" />}
            </div>

            {listing.amenities && listing.amenities.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display font-semibold">Amenities</h3>
                <ul className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
                  {listing.amenities.map((amenity) => (
                    <li key={amenity} className="rounded-full bg-muted px-3 py-1.5 capitalize">
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {listing.video_url &&
              (() => {
                const embedUrl = youtubeEmbedUrl(listing.video_url);
                return (
                  <div className="mt-8">
                    <h3 className="font-display font-semibold">Video walkthrough</h3>
                    {embedUrl ? (
                      <div className="mt-3 aspect-video overflow-hidden rounded-2xl">
                        <iframe
                          src={embedUrl}
                          title="Video walkthrough"
                          className="size-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={listing.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline"
                      >
                        Watch the video walkthrough
                      </a>
                    )}
                  </div>
                );
              })()}
          </div>
        </div>

        <div>
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-soft">
            {(listing.is_verified || listing.is_featured) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {listing.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                    <BadgeCheck className="size-3.5" /> MSN Verified
                  </span>
                )}
                {listing.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                    <Sparkles className="size-3.5" /> Featured
                  </span>
                )}
              </div>
            )}
            <p className="inline-flex items-center gap-1.5 font-display text-2xl font-semibold">
              <Euro className="size-5" />
              {priceLabel}
            </p>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <DetailRow label="Available">
                {listing.available_now
                  ? "Now"
                  : listing.available_from
                    ? `From ${listing.available_from}`
                    : "Contact for date"}
              </DetailRow>
              <DetailRow label="Stay length">
                {listing.long_term
                  ? "Long-term"
                  : listing.available_until
                    ? `Short-term, until ${listing.available_until}`
                    : "Short-term"}
              </DetailRow>
              {genderLabel && <DetailRow label="Gender preference">{genderLabel}</DetailRow>}
              {contractLabel && <DetailRow label="Registered contract">{contractLabel}</DetailRow>}
              {listing.is_modern != null && (
                <DetailRow label="Modern">{listing.is_modern ? "Yes" : "No"}</DetailRow>
              )}
            </dl>

            <EnquireButton
              email={listing.contact_email}
              phone={listing.phone_contact_consent ? listing.contact_phone : null}
              subject={`MSN enquiry: ${listing.title}`}
              label="Enquire about this room"
              className={cn(buttonVariants(), "mt-6 w-full")}
            />

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Never pay a deposit before you've seen the place in person or on live video.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function DetailStat({ icon: Icon, label }: { icon: typeof BedDouble; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 text-sm font-semibold">
      <Icon className="size-4 text-accent" />
      {label}
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

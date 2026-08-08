import { Link } from "@tanstack/react-router";
import { BedDouble, Euro, Home, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import type { ListingRow } from "@/lib/content.functions";
import roomPlaceholder from "@/assets/room-placeholder.jpg";

/** Convert a snake_case DB value like "private_room" to "Private Room" */
function formatLabel(value: string) {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ListingCard({ listing }: { listing: ListingRow }) {
  const cover = listing.images?.[0] ?? roomPlaceholder;
  // Listings from the wizard only store an approximate bucket, not a real number —
  // show the bucket ("More than €850") rather than the misleading stand-in price.
  const priceLabel = listing.rent_range || `€${listing.price}/${listing.price_period}`;

  return (
    <article className="lift-tilt group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <Link to="/accommodation/$id" params={{ id: listing.id }} className="contents">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {listing.images && listing.images.length > 1 && (
            <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
              1/{listing.images.length}
            </span>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-bold shadow-soft">
            {formatLabel(listing.room_type)}
          </span>
          {listing.is_featured && (
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground shadow-soft">
              <Sparkles className="size-3.5" />
              Featured
            </span>
          )}
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 font-display text-sm font-semibold text-primary-foreground shadow-soft">
            <Euro className="size-3.5" />
            {priceLabel}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-lg font-semibold text-balance">{listing.title}</h3>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 text-accent" />
            {listing.neighborhood}
          </p>
          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{listing.description}</p>

          <ul className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            {listing.furnished && (
              <li className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                <Home className="size-3.5 text-accent" /> Furnished
              </li>
            )}
            {listing.bills_included && (
              <li className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                <ShieldCheck className="size-3.5 text-accent" /> Bills included
              </li>
            )}
            {listing.bedrooms != null && (
              <li className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                <BedDouble className="size-3.5 text-accent" /> {listing.bedrooms} bed
              </li>
            )}
            {listing.amenities?.slice(0, 2).map((amenity) => (
              <li key={amenity} className="rounded-full bg-muted px-3 py-1 capitalize">
                {amenity}
              </li>
            ))}
          </ul>
        </div>
      </Link>

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between gap-3 border-t border-border pt-5 text-xs">
          <span className="font-semibold text-muted-foreground">
            {listing.listing_source === "student_upload"
              ? "Shared by a student"
              : "Listed by a landlord"}
          </span>
          <a
            href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(`MSN enquiry: ${listing.title}`)}`}
            className="font-display font-semibold text-accent underline-offset-4 hover:underline"
          >
            Enquire
          </a>
        </div>
      </div>
    </article>
  );
}

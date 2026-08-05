import { CalendarDays, Clock, MapPin, Ticket } from "lucide-react";
import type { EventRow } from "@/lib/content.functions";
import { Button } from "@/components/ui/button";

const categoryTint: Record<string, string> = {
  social: "bg-coral-soft text-foreground",
  culture: "bg-secondary/50 text-foreground",
  networking: "bg-mint/50 text-foreground",
  sport: "bg-sunshine-soft text-foreground",
};

export function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function EventCard({ event }: { event: EventRow }) {
  const tint = categoryTint[event.category.toLowerCase()] ?? "bg-muted text-foreground";

  return (
    <article className="lift-tilt group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {event.cover_image_url ? (
          <img
            src={event.cover_image_url}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grain size-full bg-gradient-to-br from-secondary/60 via-coral-soft to-cream-deep" />
        )}
        <span className="absolute left-4 top-4 grid rounded-2xl bg-card px-3 py-2 text-center shadow-soft">
          <span className="font-display text-xl leading-none font-semibold">
            {new Date(event.event_date).getDate()}
          </span>
          <span className="text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">
            {new Date(event.event_date).toLocaleDateString("en-GB", { month: "short" })}
          </span>
        </span>
        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold capitalize ${tint}`}
        >
          {event.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-balance">{event.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{event.description}</p>

        <dl className="mt-5 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-accent" />
            <dd>{event.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-accent" />
            <dd>{formatEventDate(event.event_date)}</dd>
          </div>
          {event.start_time && (
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-accent" />
              <dd>
                {event.start_time.slice(0, 5)}
                {event.end_time ? ` – ${event.end_time.slice(0, 5)}` : ""}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
          <span className="inline-flex items-center gap-1.5 font-display text-lg font-semibold">
            <Ticket className="size-4 text-accent" />
            {event.price > 0 ? `€${event.price}` : "Free"}
          </span>
          {event.rsvp_url ? (
            <Button asChild variant="coral" size="sm">
              <a href={event.rsvp_url} target="_blank" rel="noreferrer">
                Save my spot
              </a>
            </Button>
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">Just show up</span>
          )}
        </div>
      </div>
    </article>
  );
}

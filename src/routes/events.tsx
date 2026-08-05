import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { eventsQuery } from "@/lib/queries";
import { EventCard, formatEventDate } from "@/components/site/EventCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/motion/Motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/events")({
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQuery),
  head: () => ({
    meta: [
      { title: "Student Events in Milan | Milan Students Network" },
      { name: "description", content: "Aperitivos, city walks, language exchanges and networking nights for international students in Milan." },
      { property: "og:title", content: "Student Events in Milan" },
      { property: "og:description", content: "Find your people: social, culture and networking events across Milan." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data: events } = useSuspenseQuery(eventsQuery);
  const [filter, setFilter] = useState("all");
  const categories = ["all", ...Array.from(new Set(events.map((e) => e.category)))];
  const shown = filter === "all" ? events : events.filter((e) => e.category === filter);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <SectionHeading
        eyebrow="What's on"
        title="Something to say yes to, every week"
        description="No cliques, no awkward icebreakers you hate. Just students figuring out Milan together."
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={filter === category ? "coral" : "outline"}
            onClick={() => setFilter(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((event) => (
          <StaggerItem key={event.id} className="h-full">
            <EventCard event={event} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      {shown.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">
          Nothing in this category yet — check back soon.
        </p>
      )}

      <section className="mt-24">
        <SectionHeading eyebrow="Timeline" title="The next few weeks at a glance" />
        <ol className="relative mt-10 border-l-2 border-dashed border-border pl-8">
          {events.slice(0, 8).map((event) => (
            <li key={event.id} className="relative pb-9">
              <span className="absolute -left-[2.6rem] top-1 grid size-6 place-items-center rounded-full bg-accent text-accent-foreground">
                <span className="size-2 rounded-full bg-accent-foreground" />
              </span>
              <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                {formatEventDate(event.event_date)}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold">{event.title}</h3>
              <p className="text-sm text-muted-foreground">{event.location}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

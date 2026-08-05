import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, HeartHandshake, Home as HomeIcon, PartyPopper, ShieldCheck } from "lucide-react";
import { eventsQuery, listingsQuery, servicesQuery } from "@/lib/queries";
import { SectionHeading } from "@/components/site/SectionHeading";
import { EventCard } from "@/components/site/EventCard";
import { ListingCard } from "@/components/site/ListingCard";
import { Reveal, StaggerGroup, StaggerItem, Float } from "@/components/motion/Motion";
import { Button } from "@/components/ui/button";
import heroScene from "@/assets/hero-scene.png";
import communityScene from "@/assets/community-scene.png";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(eventsQuery),
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(listingsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Milan Students Network | Land Softly in Milan" },
      {
        name: "description",
        content:
          "A warm community for international students in Milan: hand-reviewed rooms, weekly events, and real help with the paperwork.",
      },
      { property: "og:title", content: "Milan Students Network | Land Softly in Milan" },
      {
        property: "og:description",
        content: "Rooms, friends and paperwork help for international students in Milan.",
      },
    ],
  }),
  component: HomePage,
});

const helps = [
  {
    icon: HomeIcon,
    title: "Find a room you can trust",
    body: "Listings reviewed by humans, with scam warnings and neighbourhood honesty built in.",
  },
  {
    icon: PartyPopper,
    title: "Meet your people",
    body: "Aperitivos, language swaps, day trips and study nights — every single week.",
  },
  {
    icon: ShieldCheck,
    title: "Beat the bureaucracy",
    body: "Codice fiscale, permesso di soggiorno, health cover. We've done it and we'll walk you through it.",
  },
  {
    icon: HeartHandshake,
    title: "Never feel alone",
    body: "A buddy from day one, plus a community chat that answers at 2am.",
  },
];

const stats = [
  { value: "4,800+", label: "students in the network" },
  { value: "70", label: "nationalities" },
  { value: "220+", label: "rooms reviewed" },
  { value: "48h", label: "average reply time" },
];

function HomePage() {
  const { data: events } = useSuspenseQuery(eventsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: listings } = useSuspenseQuery(listingsQuery);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="animate-blob absolute -left-32 top-10 size-96 bg-secondary/35 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-blob absolute -right-24 top-40 size-80 bg-coral-soft/70 blur-3xl"
          style={{ animationDelay: "4s" }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-bold tracking-widest uppercase shadow-soft">
                <span className="size-2 animate-pulse rounded-full bg-accent" />
                Welcome to Milano
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-6xl">
                You just landed in Milan.{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">You're not on your own.</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-1 z-0 h-4 rounded-full bg-secondary/70"
                  />
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
                Milan Students Network is a student-run community helping internationals find safe
                rooms, real friends and a way through Italian paperwork — without the panic.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="xl" variant="coral">
                  <Link to="/accommodation">
                    Find a room <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline">
                  <Link to="/events">See what's on</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-2xl font-semibold">{stat.value}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="relative">
            <Float distance={-16} duration={7}>
              <img
                src={heroScene}
                alt="Illustration of international students arriving in Milan with suitcases and a tram"
                width={1024}
                height={1024}
                className="w-full rounded-[2.5rem] shadow-lift"
              />
            </Float>
            <Float
              distance={-22}
              duration={5}
              delay={0.6}
              tilt={-4}
              className="absolute -bottom-4 -left-2 hidden rounded-3xl bg-card p-4 shadow-lift sm:block"
            >
              <p className="font-display text-sm font-semibold">Room found in 6 days</p>
              <p className="text-xs text-muted-foreground">— Aylin, Politecnico</p>
            </Float>
            <Float
              distance={-18}
              duration={6}
              delay={1.2}
              tilt={5}
              className="absolute -top-2 right-0 hidden rounded-3xl bg-secondary p-4 shadow-lift sm:block"
            >
              <p className="font-display text-sm font-semibold text-secondary-foreground">
                12 events this month
              </p>
            </Float>
          </div>
        </div>
      </section>

      {/* How we help */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionHeading
          eyebrow="How we help"
          title="Four things that make month one easier"
          align="center"
        />
        <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {helps.map((help) => (
            <StaggerItem key={help.title} className="h-full">
              <div className="lift-tilt h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
                <span className="grid size-14 place-items-center rounded-2xl bg-coral-soft">
                  <help.icon className="size-6 text-foreground" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{help.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{help.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Why MSN */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid items-center gap-12 rounded-[2.5rem] bg-cream-deep p-8 sm:p-12 lg:grid-cols-2">
          <Reveal>
            <Float distance={-12} duration={8}>
              <img
                src={communityScene}
                alt="Illustration of a diverse group of students laughing together"
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full rounded-[2rem] shadow-lift"
              />
            </Float>
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="Why MSN"
              title="Built by students who arrived confused too"
              description="We're not an agency. Nobody here earns commission on your rent. Everything we know came from getting it wrong first — and we hand that over for free."
            />
            <Button asChild variant="default" size="lg" className="mt-8">
              <Link to="/about">Read our story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured events */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Events" title="Coming up soon" className="max-w-lg" />
          <Button asChild variant="outline">
            <Link to="/events">All events</Link>
          </Button>
        </div>
        <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <StaggerItem key={event.id} className="h-full">
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Featured services */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Services" title="Help with the hard bits" className="max-w-lg" />
          <Button asChild variant="outline">
            <Link to="/services">All services</Link>
          </Button>
        </div>
        <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <StaggerItem key={service.id} className="h-full">
              <div className="lift-tilt h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    service.is_paid ? "bg-coral-soft" : "bg-mint/60"
                  }`}
                >
                  {service.is_paid ? "Paid" : "Free"}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{service.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.short_description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Featured accommodation */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Accommodation"
            title="Rooms we'd send a friend to"
            className="max-w-lg"
          />
          <Button asChild variant="outline">
            <Link to="/accommodation">Browse all</Link>
          </Button>
        </div>
        <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.slice(0, 3).map((listing) => (
            <StaggerItem key={listing.id} className="h-full">
              <ListingCard listing={listing} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-16 text-center text-primary-foreground sm:px-12">
          <div
            aria-hidden
            className="animate-blob absolute -left-20 -top-20 size-72 bg-accent/30 blur-3xl"
          />
          <div
            aria-hidden
            className="animate-tram absolute bottom-6 left-0 text-4xl"
            style={{ animationDuration: "22s" }}
          >
            🚋
          </div>
          <h2 className="relative text-3xl font-semibold text-balance sm:text-4xl">
            Milan is a lot friendlier with people in it
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join the network, come to one event, ask one question. That's usually all it takes.
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="xl" variant="sunshine">
              <Link to="/contact">Join the community</Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link to="/accommodation">Find a room</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}

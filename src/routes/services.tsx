import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { servicesQuery } from "@/lib/queries";
import { ServiceCard } from "@/components/site/ServiceCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/motion/Motion";

export const Route = createFileRoute("/services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({
    meta: [
      { title: "Student Support Services in Milan | Milan Students Network" },
      { name: "description", content: "Codice fiscale, permesso di soggiorno, housing help and airport pickups — free and paid support for international students." },
      { property: "og:title", content: "Student Support Services in Milan" },
      { property: "og:description", content: "Paperwork, housing and settling-in help from students who have already done it." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const free = services.filter((s) => !s.is_paid);
  const paid = services.filter((s) => s.is_paid);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <SectionHeading
        eyebrow="Support"
        title="The paperwork won't beat you"
        description="We've queued at the questura so you don't have to guess. Some things we do for free, others cover our costs."
      />

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold">Always free</h2>
        <StaggerGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {free.map((service) => (
            <StaggerItem key={service.id} className="h-full">
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-2xl font-semibold">Hands-on help</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Paid services keep the community running. You'll always get a clear quote by email before
          anything is charged.
        </p>
        <StaggerGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paid.map((service) => (
            <StaggerItem key={service.id} className="h-full">
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </div>
  );
}

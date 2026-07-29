import { Link } from "react-router-dom";

const services = [
  {
    slug: "accommodation",
    title: "Accommodation",
    description: "Find safe, student-friendly housing across Milan with our vetted partners.",
    icon: "🏠",
  },
  {
    slug: "events-activities",
    title: "Events & Activities",
    description: "Meet other students through curated events, trips, and social activities.",
    icon: "🎉",
  },
  {
    slug: "premium-services",
    title: "Premium Services",
    description: "Get priority support, exclusive perks, and personalized assistance.",
    icon: "⭐",
  },
];

export default function ServicesSection({ settings }) {
  const heading = settings?.content?.heading || "What We Offer";
  const body = settings?.content?.body;
  const bgImage = settings?.background_image_url;

  return (
    <section
      id="services"
      className="bg-msn-navy bg-cover bg-center px-6 py-16 sm:py-20"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-white">{heading}</h2>
        {body && (
          <p className="mx-auto mt-3 max-w-2xl text-center text-msn-cream/70">{body}</p>
        )}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              to={`/services/${service.slug}`}
              className="rounded-xl border border-white/10 bg-msn-navy-light p-6 text-left transition hover:border-msn-gold/50 hover:bg-msn-navy-light/80"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-msn-gold/15 text-2xl">
                {service.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{service.title}</h3>
              <p className="mt-2 text-sm text-msn-cream/60">{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

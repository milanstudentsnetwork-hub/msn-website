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
      className="bg-white bg-cover bg-center px-6 py-16"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-slate-900">{heading}</h2>
        {body && <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">{body}</p>}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              to={`/services/${service.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
            >
              <span className="text-3xl">{service.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{service.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

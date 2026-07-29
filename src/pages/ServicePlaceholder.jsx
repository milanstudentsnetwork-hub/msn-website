import { Link, useParams } from "react-router-dom";

const titles = {
  accommodation: "Accommodation",
  "events-activities": "Events & Activities",
  "premium-services": "Premium Services",
};

export default function ServicePlaceholder() {
  const { slug } = useParams();
  const title = titles[slug] || "Service";

  return (
    <section className="bg-msn-cream px-6 py-24 text-center">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-msn-ink">{title}</h1>
        <p className="mt-4 text-msn-ink/60">
          This page is coming soon. We'll build out the full {title.toLowerCase()} page next.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block text-sm font-semibold text-msn-ink underline decoration-msn-gold decoration-2 underline-offset-4"
        >
          &larr; Back to home
        </Link>
      </div>
    </section>
  );
}

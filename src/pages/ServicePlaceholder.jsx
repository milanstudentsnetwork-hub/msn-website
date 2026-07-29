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
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-4 text-slate-600">
        This page is coming soon. We'll build out the full {title.toLowerCase()} page next.
      </p>
      <Link to="/" className="mt-8 inline-block text-indigo-600 hover:underline">
        &larr; Back to home
      </Link>
    </section>
  );
}

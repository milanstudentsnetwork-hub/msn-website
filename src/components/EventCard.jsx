export default function EventCard({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-msn-navy/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {event.image_url ? (
        <img
          src={event.image_url}
          alt={event.title}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="h-2 w-full bg-msn-gold" />
      )}
      <div className="p-5">
        <p className="inline-block rounded-full bg-msn-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-msn-gold">
          {formattedDate}
        </p>
        <h3 className="mt-3 text-lg font-semibold text-msn-ink">{event.title}</h3>
        {event.description && (
          <p className="mt-2 text-sm text-msn-ink/60">{event.description}</p>
        )}
      </div>
    </article>
  );
}

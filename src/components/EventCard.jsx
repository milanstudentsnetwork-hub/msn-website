export default function EventCard({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="h-44 w-full object-cover"
        />
      )}
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {formattedDate}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">{event.title}</h3>
        {event.description && (
          <p className="mt-2 text-sm text-slate-600">{event.description}</p>
        )}
      </div>
    </article>
  );
}

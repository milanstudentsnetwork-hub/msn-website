import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import EventCard from "../components/EventCard";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .then(({ data }) => {
        if (active) setEvents(data ?? []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Events</h1>
      <p className="mt-2 text-slate-600">Everything happening in the Milan Student Network community.</p>

      {loading ? (
        <p className="mt-10 text-slate-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="mt-10 text-slate-500">No events published yet — check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useSiteSettings } from "../lib/useSiteSettings";
import Hero from "../components/Hero";
import ServicesSection from "../components/ServicesSection";
import EventCard from "../components/EventCard";
import FaqItem from "../components/FaqItem";

function EventsPreview({ settings }) {
  const [events, setEvents] = useState([]);
  const bgImage = settings?.background_image_url;

  useEffect(() => {
    let active = true;
    supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .limit(3)
      .then(({ data }) => {
        if (active) setEvents(data ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      className="bg-msn-mint bg-cover bg-center px-6 py-16 sm:py-20"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-msn-ink">
          {settings?.content?.heading || "Upcoming Events"}
        </h2>
        {events.length === 0 ? (
          <p className="mt-6 text-center text-msn-ink/60">No upcoming events yet — check back soon.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link to="/events" className="text-sm font-semibold text-msn-ink underline decoration-msn-gold decoration-2 underline-offset-4">
            View all events &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

function FaqPreview({ settings }) {
  const [faqs, setFaqs] = useState([]);
  const bgImage = settings?.background_image_url;

  useEffect(() => {
    let active = true;
    supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true })
      .limit(3)
      .then(({ data }) => {
        if (active) setFaqs(data ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      className="bg-msn-cream bg-cover bg-center px-6 py-16 sm:py-20"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold text-msn-ink">
          {settings?.content?.heading || "Frequently Asked Questions"}
        </h2>
        {faqs.length === 0 ? (
          <p className="mt-6 text-center text-msn-ink/60">No FAQs published yet.</p>
        ) : (
          <div className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.id} faq={faq} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link to="/faq" className="text-sm font-semibold text-msn-ink underline decoration-msn-gold decoration-2 underline-offset-4">
            View all FAQs &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

const SECTION_COMPONENTS = {
  hero: Hero,
  services: ServicesSection,
  events: EventsPreview,
  faq: FaqPreview,
};

export default function Home() {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return <div className="bg-msn-cream py-24 text-center text-msn-ink/60">Loading...</div>;
  }

  const orderedSections = settings.length
    ? settings
    : [
        { section_key: "hero" },
        { section_key: "services" },
        { section_key: "events" },
        { section_key: "faq" },
      ];

  return (
    <div>
      {orderedSections
        .filter((section) => section.enabled !== false)
        .map((section) => {
          const SectionComponent = SECTION_COMPONENTS[section.section_key];
          if (!SectionComponent) return null;
          return <SectionComponent key={section.section_key} settings={section} />;
        })}
    </div>
  );
}

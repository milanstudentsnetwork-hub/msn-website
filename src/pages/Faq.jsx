import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FaqItem from "../components/FaqItem";

export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (active) setFaqs(data ?? []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="bg-msn-cream px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-msn-ink">Frequently Asked Questions</h1>
        <p className="mt-2 text-msn-ink/60">Answers to common questions about the Milan Student Network.</p>

        {loading ? (
          <p className="mt-10 text-msn-ink/60">Loading FAQs...</p>
        ) : faqs.length === 0 ? (
          <p className="mt-10 text-msn-ink/60">No FAQs published yet.</p>
        ) : (
          <div className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.id} faq={faq} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

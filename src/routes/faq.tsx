import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { faqsQuery } from "@/lib/queries";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/faq")({
  loader: ({ context }) => context.queryClient.ensureQueryData(faqsQuery),
  head: () => ({
    meta: [
      { title: "FAQ for International Students in Milan | Milan Students Network" },
      { name: "description", content: "Visas, rent deposits, codice fiscale, transport passes — honest answers to the questions students ask us most." },
      { property: "og:title", content: "FAQ for International Students in Milan" },
      { property: "og:description", content: "Honest answers about moving to and living in Milan as a student." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: faqs } = useSuspenseQuery(faqsQuery);
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <SectionHeading
        eyebrow="Good questions"
        title="Everything you were slightly afraid to ask"
        description="If it's not here, message us — we answer every single one."
        align="center"
      />

      <div className="mt-12 space-y-3">
        {faqs.map((faq) => {
          const isOpen = open === faq.id;
          return (
            <div
              key={faq.id}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display text-base font-semibold"
                >
                  {faq.question}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary/50"
                  >
                    <Plus className="size-4" />
                  </motion.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

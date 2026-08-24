import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ServiceRow } from "@/lib/content.functions";
import { Button } from "@/components/ui/button";
import { ServiceRequestForm } from "@/components/site/ServiceRequestForm";

export function ServiceCard({ service }: { service: ServiceRow }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="lift-tilt flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-secondary/50">
          <Sparkles className="size-6 text-foreground" />
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            service.is_paid ? "bg-coral-soft text-foreground" : "bg-mint/60 text-foreground"
          }`}
        >
          {service.is_paid
            ? `From €${service.price ?? 0}${service.price_note ? ` ${service.price_note}` : ""}`
            : "Free"}
        </span>
      </div>

      <h3 className="mt-5 font-display text-xl font-semibold text-balance">{service.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{service.short_description}</p>

      {service.full_description && (
        <p className="mt-3 text-sm text-muted-foreground/90">{service.full_description}</p>
      )}

      <div className="mt-auto pt-6">
        {service.booking_url ? (
          <Button asChild variant={service.is_paid ? "coral" : "outline"} className="w-full">
            <a href={service.booking_url} target="_blank" rel="noreferrer">
              {service.cta_label || "Get help"}
            </a>
          </Button>
        ) : (
          <Button
            variant={service.is_paid ? "coral" : "outline"}
            className="w-full"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? "Close form" : service.cta_label || "Request this"}
          </Button>
        )}

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-5">
                <ServiceRequestForm
                  serviceId={service.id}
                  serviceName={service.name}
                  onDone={() => setOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {service.category && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Check className="size-3.5 text-accent" />
          {service.category}
        </p>
      )}
    </article>
  );
}

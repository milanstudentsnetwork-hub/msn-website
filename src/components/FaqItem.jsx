import { useState } from "react";

export default function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-msn-navy/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-medium text-msn-ink">{faq.question}</span>
        <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-msn-gold/15 text-msn-gold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="border-t border-msn-navy/10 px-5 py-4 text-sm text-msn-ink/60">
          <p className="whitespace-pre-line">{faq.answer}</p>
          {faq.reference_data && (
            <p className="mt-2 text-xs text-msn-ink/40">Ref: {faq.reference_data}</p>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

export default function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-medium text-slate-900">{faq.question}</span>
        <span className="ml-4 text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
          <p className="whitespace-pre-line">{faq.answer}</p>
          {faq.reference_data && (
            <p className="mt-2 text-xs text-slate-400">Ref: {faq.reference_data}</p>
          )}
        </div>
      )}
    </div>
  );
}

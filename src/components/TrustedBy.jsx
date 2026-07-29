const universities = [
  "Università Bocconi",
  "Politecnico di Milano",
  "Università Statale",
  "Università Bicocca",
  "IULM",
];

export default function TrustedBy() {
  return (
    <div className="bg-msn-cream px-6 pb-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-msn-ink/40">
          Connecting students across Milan's universities
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {universities.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold text-msn-ink/50"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

import MsnLogo from "./MsnLogo";
import TrustedBy from "./TrustedBy";

const tags = ["Student-run", "Made in Milan", "All nationalities welcome"];

export default function Hero({ settings }) {
  const heading = settings?.content?.heading || "Your home away from home in Milan";
  const body =
    settings?.content?.body ||
    "Write a description of what Milan Student Network is from the admin dashboard.";
  const bgImage = settings?.background_image_url;

  if (bgImage) {
    return (
      <section
        className="relative flex min-h-[420px] items-center justify-center bg-msn-navy bg-cover bg-center px-6 text-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-msn-navy/60" />
        <div className="relative max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {heading}
          </h1>
          <p className="mt-4 whitespace-pre-line text-lg text-white/90">{body}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="bg-msn-cream pt-16 sm:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 sm:pb-20 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-msn-ink sm:text-5xl">
            {heading}
          </h1>
          <p className="mt-5 whitespace-pre-line text-lg text-msn-ink/70">{body}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#services"
              className="rounded-full bg-msn-navy px-6 py-3 text-sm font-semibold text-msn-cream shadow-sm transition hover:bg-msn-navy-light"
            >
              Explore Services
            </a>
            <a
              href="/events"
              className="text-sm font-semibold text-msn-ink underline decoration-msn-gold decoration-2 underline-offset-4"
            >
              See upcoming events
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-msn-navy/15 bg-white/60 px-4 py-1.5 text-xs font-medium text-msn-ink/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-96 sm:w-96">
          <div
            className="absolute inset-0 bg-msn-gold-light"
            style={{ borderRadius: "62% 38% 33% 67% / 58% 32% 68% 42%" }}
          />
          <MsnLogo className="relative h-40 w-40 drop-shadow-lg sm:h-52 sm:w-52" />
        </div>
      </div>
      <TrustedBy />
    </section>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal, Float } from "@/components/motion/Motion";
import { Button } from "@/components/ui/button";
import communityScene from "@/assets/community-scene.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Milan Students Network | Our Story" },
      { name: "description", content: "We're international students in Milan who got tired of figuring everything out alone — so we built the network we needed." },
      { property: "og:title", content: "About Milan Students Network" },
      { property: "og:description", content: "A student-run community for internationals landing in Milan." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { emoji: "🤝", title: "Nobody arrives alone", body: "Every new student gets a welcome, a WhatsApp group and a face to look for." },
  { emoji: "🔎", title: "Honest by default", body: "We review every room listing by hand and tell you when a deal looks wrong." },
  { emoji: "🌍", title: "Every passport welcome", body: "70+ nationalities, one city, zero gatekeeping." },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Our story"
            title="We built the network we wished existed"
            description="In 2021 three exchange students shared one truth: Milan is wonderful and completely bewildering in your first month. Rent scams, silent bureaucracy, nobody to eat dinner with. So we started a group chat. It grew."
          />
          <p className="mt-5 max-w-xl text-muted-foreground">
            Today Milan Students Network is a volunteer-run community: students helping students find
            safe rooms, understand paperwork, and build a life that feels like theirs.
          </p>
          <Button asChild variant="coral" size="lg" className="mt-8">
            <Link to="/contact">Get in touch</Link>
          </Button>
        </div>
        <Reveal>
          <Float distance={-14} duration={7}>
            <img
              src={communityScene}
              alt="Illustration of international students laughing together"
              loading="lazy"
              className="w-full rounded-[2.5rem] shadow-lift"
            />
          </Float>
        </Reveal>
      </div>

      <div className="mt-24 grid gap-6 md:grid-cols-3">
        {values.map((value, index) => (
          <Reveal key={value.title} delay={index * 0.08}>
            <div className="lift-tilt h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
              <span className="text-4xl">{value.emoji}</span>
              <h3 className="mt-4 font-display text-lg font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{value.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

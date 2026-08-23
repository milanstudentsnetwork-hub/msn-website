import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, MessageCircle, Search } from "lucide-react";
import { RequestFlow } from "./RequestFlow";
import { ListingFlow } from "./ListingFlow";

type Screen = "start" | "request" | "listing";

export function AccommodationWizard() {
  const [screen, setScreen] = useState<Screen>("start");

  if (screen === "request") {
    return <RequestFlow onBackToStart={() => setScreen("start")} />;
  }
  if (screen === "listing") {
    return <ListingFlow onBackToStart={() => setScreen("start")} />;
  }

  return (
    <div className="@container relative overflow-hidden rounded-[2.5rem] bg-card p-6 text-center shadow-lift sm:p-8">
      <div
        aria-hidden
        className="animate-blob absolute -left-16 -top-16 size-56 bg-accent/25 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-blob absolute -right-12 -bottom-12 size-56 bg-secondary/30 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary/40 px-4 py-1.5 text-xs font-bold tracking-widest text-foreground uppercase">
          <span className="size-2 rounded-full bg-accent" />
          Get started
        </span>
        <h3 className="mt-4 font-display text-2xl font-semibold">Find or List Accommodation</h3>
        <p className="mt-2 text-muted-foreground">
          Tell us what you need and we will help you find the right match.
        </p>
        <div className="mt-8 grid gap-4 @sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setScreen("request")}
            className="lift-tilt flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-6 text-center transition-colors hover:border-accent"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-coral-soft">
              <Search className="size-6" />
            </span>
            <span className="font-display font-semibold">I'm Looking for Accommodation</span>
          </button>
          <button
            type="button"
            onClick={() => setScreen("listing")}
            className="lift-tilt flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-6 text-center transition-colors hover:border-accent"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-secondary/50">
              <Home className="size-6" />
            </span>
            <span className="font-display font-semibold">
              I Want to Post an Accommodation Listing
            </span>
          </button>
        </div>

        <Link
          to="/contact"
          className="lift-tilt mt-4 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center transition-colors hover:border-accent"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-muted">
            <MessageCircle className="size-6" />
          </span>
          <span className="font-display font-semibold">
            Need help with something else? Say hello
          </span>
        </Link>
      </div>
    </div>
  );
}

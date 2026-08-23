import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, MessageCircle, Search } from "lucide-react";
import { Float } from "@/components/motion/Motion";
import { RequestFlow } from "./RequestFlow";
import { ListingFlow } from "./ListingFlow";
import wizardGuide from "@/assets/wizard-guide.png";

type Screen = "start" | "request" | "listing";

export function AccommodationWizard() {
  const [screen, setScreen] = useState<Screen>("start");

  if (screen === "request" || screen === "listing") {
    return (
      <div className="relative">
        <div className="relative z-10 -mb-14 mx-auto w-28 sm:w-36">
          <Float distance={-8} duration={6}>
            <img src={wizardGuide} alt="" className="w-full drop-shadow-xl" />
          </Float>
        </div>
        {screen === "request" ? (
          <RequestFlow onBackToStart={() => setScreen("start")} />
        ) : (
          <ListingFlow onBackToStart={() => setScreen("start")} />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center sm:p-12">
      <h3 className="font-display text-2xl font-semibold">Find or List Accommodation</h3>
      <p className="mt-2 text-muted-foreground">
        Tell us what you need and we will help you find the right match.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setScreen("request")}
          className="lift-tilt flex flex-col items-center gap-3 rounded-2xl border-2 border-border p-6 text-center transition-colors hover:border-accent"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-coral-soft">
            <Search className="size-6" />
          </span>
          <span className="font-display font-semibold">I'm Looking for Accommodation</span>
        </button>
        <button
          type="button"
          onClick={() => setScreen("listing")}
          className="lift-tilt flex flex-col items-center gap-3 rounded-2xl border-2 border-border p-6 text-center transition-colors hover:border-accent"
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
        className="lift-tilt mt-4 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-accent"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-muted">
          <MessageCircle className="size-6" />
        </span>
        <span className="font-display font-semibold">Need help with something else? Say hello</span>
      </Link>
    </div>
  );
}

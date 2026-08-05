import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitListing } from "@/lib/submissions.functions";

type Source = "landlord" | "student_upload";

const copy: Record<Source, { badge: string; note: string; cta: string }> = {
  landlord: {
    badge: "For landlords & agencies",
    note: "Reach thousands of verified international students. Every listing is reviewed by our team before it goes live — usually within 48 hours.",
    cta: "Submit property",
  },
  student_upload: {
    badge: "For students",
    note: "Leaving Milan, subletting for a semester, or looking for a flatmate? Share your room with the community. We review before publishing.",
    cta: "Upload my room",
  },
};

export function ListingSubmissionForm({ source }: { source: Source }) {
  const submit = useServerFn(submitListing);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const text = copy[source];
  const id = source;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await submit({
        data: {
          listing_source: source,
          title: String(form.get("title") ?? ""),
          description: String(form.get("description") ?? ""),
          neighborhood: String(form.get("neighborhood") ?? ""),
          room_type: String(form.get("room_type") ?? "single room"),
          price: Number(form.get("price") ?? 0),
          price_period: "month",
          bills_included: form.get("bills_included") === "on",
          furnished: form.get("furnished") === "on",
          students_only: true,
          available_from: String(form.get("available_from") ?? "") || null,
          contact_name: String(form.get("contact_name") ?? ""),
          contact_email: String(form.get("contact_email") ?? ""),
          contact_phone: String(form.get("contact_phone") ?? "") || null,
          address_note: String(form.get("address_note") ?? "") || null,
        },
      });
      setDone(true);
      toast.success("Thanks! Your listing is in the review queue.");
    } catch {
      toast.error("We couldn't submit that. Please check the fields and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-accent/40 bg-card p-8 text-center shadow-soft">
        <div className="animate-float mx-auto grid size-16 place-items-center rounded-3xl bg-secondary text-3xl">
          🎉
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold">Received, thank you!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team reviews every submission by hand. You'll hear from us by email within two working
          days.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
    >
      <span className="inline-flex rounded-full bg-secondary/50 px-3 py-1 text-xs font-bold tracking-wide uppercase">
        {text.badge}
      </span>
      <p className="mt-4 text-sm text-muted-foreground">{text.note}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${id}-title`}>Listing title</Label>
          <Input
            id={`${id}-title`}
            name="title"
            required
            minLength={4}
            maxLength={120}
            placeholder="Bright single room near Bocconi"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-neighborhood`}>Neighbourhood</Label>
          <Input
            id={`${id}-neighborhood`}
            name="neighborhood"
            required
            maxLength={80}
            placeholder="Navigli"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-room_type`}>Room type</Label>
          <select
            id={`${id}-room_type`}
            name="room_type"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            defaultValue="single room"
          >
            <option value="single room">Single room</option>
            <option value="double room">Double room</option>
            <option value="studio">Studio</option>
            <option value="entire flat">Entire flat</option>
            <option value="shared room">Shared room</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-price`}>Monthly rent (€)</Label>
          <Input id={`${id}-price`} name="price" type="number" min={0} max={100000} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-available_from`}>Available from</Label>
          <Input id={`${id}-available_from`} name="available_from" type="date" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${id}-description`}>Description</Label>
          <Textarea
            id={`${id}-description`}
            name="description"
            required
            minLength={20}
            maxLength={2000}
            rows={4}
            placeholder="Tell students about the room, the flatmates, transport links and house rules."
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${id}-address_note`}>Nearest metro / area note (optional)</Label>
          <Input id={`${id}-address_note`} name="address_note" maxLength={300} />
        </div>

        <div className="flex flex-wrap gap-5 sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="furnished"
              className="size-4 accent-[var(--coral)]"
              defaultChecked
            />
            Furnished
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="bills_included" className="size-4 accent-[var(--coral)]" />
            Bills included
          </label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-contact_name`}>Your name</Label>
          <Input id={`${id}-contact_name`} name="contact_name" required maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-contact_email`}>Your email</Label>
          <Input
            id={`${id}-contact_email`}
            name="contact_email"
            type="email"
            required
            maxLength={255}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${id}-contact_phone`}>Phone / WhatsApp (optional)</Label>
          <Input id={`${id}-contact_phone`} name="contact_phone" maxLength={40} />
        </div>
      </div>

      <Button
        type="submit"
        variant={source === "landlord" ? "default" : "coral"}
        size="lg"
        className="mt-7 w-full"
        disabled={busy}
      >
        {busy ? "Sending…" : text.cta}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Photos can be added by replying to our confirmation email.
      </p>
    </form>
  );
}

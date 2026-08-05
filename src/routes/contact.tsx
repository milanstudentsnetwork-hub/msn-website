import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/lib/submissions.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Milan Students Network" },
      { name: "description", content: "Questions about housing, events or paperwork in Milan? Message the student team and we'll reply within two days." },
      { property: "og:title", content: "Contact Milan Students Network" },
      { property: "og:description", content: "Message the student team behind Milan Students Network." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const submit = useServerFn(submitContactMessage);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await submit({
        data: {
          full_name: String(form.get("full_name") ?? ""),
          email: String(form.get("email") ?? ""),
          subject: String(form.get("subject") ?? ""),
          message: String(form.get("message") ?? ""),
        },
      });
      setSent(true);
      toast.success("Message sent — talk soon!");
    } catch {
      toast.error("That didn't send. Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <SectionHeading
        eyebrow="Say hello"
        title="Real students read every message"
        description="Housing worries, event ideas, or just want someone to tell you which SIM card to buy — write to us."
        align="center"
      />

      {sent ? (
        <div className="mt-12 rounded-3xl border-2 border-dashed border-accent/40 bg-card p-10 text-center shadow-soft">
          <div className="animate-float mx-auto grid size-16 place-items-center rounded-3xl bg-secondary text-3xl">
            ✉️
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold">Message received</h2>
          <p className="mt-2 text-sm text-muted-foreground">We usually reply within two days.</p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-12 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Your name</Label>
              <Input id="c-name" name="full_name" required maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" name="email" type="email" required maxLength={255} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-subject">Subject</Label>
            <Input id="c-subject" name="subject" required maxLength={140} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-message">Message</Label>
            <Textarea id="c-message" name="message" required minLength={10} maxLength={2000} rows={5} />
          </div>
          <Button type="submit" variant="coral" size="lg" className="w-full" disabled={busy}>
            {busy ? "Sending…" : "Send message"}
          </Button>
        </form>
      )}
    </div>
  );
}

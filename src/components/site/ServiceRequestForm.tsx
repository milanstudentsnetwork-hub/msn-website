import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitServiceRequest } from "@/lib/submissions.functions";

export function ServiceRequestForm({
  serviceId,
  serviceName,
  onDone,
}: {
  serviceId: string;
  serviceName: string;
  onDone?: () => void;
}) {
  const submit = useServerFn(submitServiceRequest);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await submit({
        data: {
          service_id: serviceId,
          service_name: serviceName,
          full_name: String(form.get("full_name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? "") || null,
          university: String(form.get("university") ?? "") || null,
          details: String(form.get("details") ?? ""),
        },
      });
      toast.success("Request sent! We'll reply by email within 48 hours.");
      onDone?.();
    } catch {
      toast.error("Something went wrong. Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-muted/60 p-4 text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${serviceId}-name`}>Your name</Label>
          <Input id={`${serviceId}-name`} name="full_name" required maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${serviceId}-email`}>Email</Label>
          <Input id={`${serviceId}-email`} name="email" type="email" required maxLength={255} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${serviceId}-phone`}>Phone (optional)</Label>
          <Input id={`${serviceId}-phone`} name="phone" maxLength={40} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${serviceId}-uni`}>University (optional)</Label>
          <Input id={`${serviceId}-uni`} name="university" maxLength={120} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${serviceId}-details`}>How can we help?</Label>
        <Textarea id={`${serviceId}-details`} name="details" rows={3} maxLength={2000} />
      </div>
      <Button type="submit" variant="coral" className="w-full" disabled={busy}>
        {busy ? "Sending…" : "Send request"}
      </Button>
    </form>
  );
}

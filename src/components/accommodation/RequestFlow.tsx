import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { submitAccommodationRequest } from "@/lib/submissions.functions";
import { formatSubmitError } from "@/lib/format-submit-error";
import { cn } from "@/lib/utils";
import { todayIso } from "@/lib/accommodation-options";
import { ProgressBar, WizardStep, WizardNav, FieldError } from "./WizardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TOTAL_STEPS = 4;

const ROOM_TYPES = [
  { value: "studio", label: "Studio / Monolocale" },
  { value: "single_shared_flat", label: "Single room in a shared flat" },
  { value: "shared_bed", label: "Shared bed space (sharing a room with another person)" },
];

const BUDGETS = ["Less than €400", "€400–€550", "€550–€700", "€700–€850", "More than €850"];
const ROOMMATES = ["1", "2", "3", "4", "4+"];

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  move_immediately: string;
  stay_type: string;
  date_from: string;
  date_until: string;
  needs_contract: string;
  room_type: string;
  budget_range: string;
  max_roommates: string;
  location_preferences: string;
  notes: string;
  consent: boolean;
  honeypot: string;
};

const emptyForm: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gender: "",
  move_immediately: "",
  stay_type: "",
  date_from: "",
  date_until: "",
  needs_contract: "",
  room_type: "",
  budget_range: "",
  max_roommates: "",
  location_preferences: "",
  notes: "",
  consent: false,
  honeypot: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validateStep(step: number, data: FormState): FormErrors {
  const errors: FormErrors = {};
  if (step === 1) {
    if (!data.first_name.trim()) errors.first_name = "Required.";
    if (!data.last_name.trim()) errors.last_name = "Required.";
    if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "Enter a valid email address.";
    if (data.phone.trim().length < 3) errors.phone = "Enter a valid phone number.";
    if (!data.gender) errors.gender = "Please select an option.";
  }
  if (step === 2) {
    if (!data.move_immediately) errors.move_immediately = "Please select an option.";
    if (data.move_immediately === "no" && !data.date_from)
      errors.date_from = "Please choose a date.";
    if (!data.stay_type) errors.stay_type = "Please select an option.";
    if (data.stay_type === "short_term" && !data.date_until) {
      errors.date_until = "Please choose an end date.";
    }
  }
  if (step === 3) {
    if (!data.needs_contract) errors.needs_contract = "Please select an option.";
  }
  if (step === 4) {
    if (!data.room_type) errors.room_type = "Please select an option.";
    if (!data.budget_range) errors.budget_range = "Please select an option.";
    if (!data.max_roommates) errors.max_roommates = "Please select an option.";
    if (!data.location_preferences.trim())
      errors.location_preferences = "Please tell us your preferred area.";
    if (!data.consent) errors.consent = "Please confirm before submitting.";
  }
  return errors;
}

export function RequestFlow({ onBackToStart }: { onBackToStart: () => void }) {
  const submitFn = useServerFn(submitAccommodationRequest);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function goNext() {
    const stepErrors = validateStep(step, data);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    void handleSubmit();
  }

  function goBack() {
    if (step === 1) {
      onBackToStart();
      return;
    }
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitFn({
        data: {
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          gender: data.gender as "male" | "female" | "prefer_not_to_say",
          move_immediately: data.move_immediately === "yes",
          stay_type: data.stay_type as "short_term" | "long_term",
          date_from: data.date_from || null,
          date_until: data.stay_type === "short_term" ? data.date_until || null : null,
          needs_contract: data.needs_contract === "yes",
          room_type: data.room_type as "studio" | "single_shared_flat" | "shared_bed",
          budget_range: data.budget_range as (typeof BUDGETS)[number],
          max_roommates: data.max_roommates as (typeof ROOMMATES)[number],
          location_preferences: data.location_preferences.trim(),
          notes: data.notes.trim() || null,
          honeypot: data.honeypot || undefined,
        },
      });
      setDone(true);
    } catch (err) {
      console.error("Request submission failed", err);
      toast.error(`Something went wrong: ${formatSubmitError(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <h3 className="font-display text-xl font-semibold">
          Thank you, your request has been registered.
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          You will receive a confirmation email at your registered email address. Our matching team
          is working to find suitable accommodation and will contact you as soon as a match is
          available.
        </p>
        <Button className="mt-6" variant="outline" onClick={onBackToStart}>
          Back to start
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* Honeypot — hidden from real users, bots tend to fill every field */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="req-website">Website</label>
        <input
          id="req-website"
          tabIndex={-1}
          autoComplete="off"
          value={data.honeypot}
          onChange={(e) => set("honeypot", e.target.value)}
        />
      </div>

      <div className="mt-6">
        {step === 1 && (
          <WizardStep title="Personal information">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="req-first-name">First name</Label>
                <Input
                  id="req-first-name"
                  value={data.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                />
                <FieldError message={errors.first_name} />
              </div>
              <div>
                <Label htmlFor="req-last-name">Surname</Label>
                <Input
                  id="req-last-name"
                  value={data.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                />
                <FieldError message={errors.last_name} />
              </div>
              <div>
                <Label htmlFor="req-email">Email address</Label>
                <Input
                  id="req-email"
                  type="email"
                  value={data.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                <FieldError message={errors.email} />
              </div>
              <div>
                <Label htmlFor="req-phone">Phone number (add Country Code)</Label>
                <Input
                  id="req-phone"
                  type="tel"
                  placeholder="+39 333 1234567"
                  value={data.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                <FieldError message={errors.phone} />
              </div>
            </div>
            <div>
              <Label>Gender, for accommodation matching purposes only</Label>
              <RadioGroup
                value={data.gender}
                onValueChange={(v) => set("gender", v)}
                className="mt-2"
              >
                {[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "prefer_not_to_say", label: "Prefer not to say" },
                ].map(({ value, label }) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem value={value} id={`req-gender-${value}`} />
                    <Label htmlFor={`req-gender-${value}`} className="font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <FieldError message={errors.gender} />
            </div>
          </WizardStep>
        )}

        {step === 2 && (
          <WizardStep title="Urgency and stay type">
            <div>
              <Label>Would you like to find accommodation immediately?</Label>
              <RadioGroup
                value={data.move_immediately}
                onValueChange={(v) => {
                  set("move_immediately", v);
                  // Immediately means the start date is today — no need to ask.
                  set("date_from", v === "yes" ? todayIso() : "");
                }}
                className="mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="req-urgent-yes" />
                  <Label htmlFor="req-urgent-yes" className="font-normal">
                    Yes, I need to move immediately
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="req-urgent-no" />
                  <Label htmlFor="req-urgent-no" className="font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
              <FieldError message={errors.move_immediately} />
            </div>

            {data.move_immediately === "no" && (
              <div>
                <Label htmlFor="req-date-from">From what date would you like to move in?</Label>
                <Input
                  id="req-date-from"
                  type="date"
                  value={data.date_from}
                  onChange={(e) => set("date_from", e.target.value)}
                />
                <FieldError message={errors.date_from} />
              </div>
            )}

            <div>
              <Label>Are you looking for short-term or long-term accommodation?</Label>
              <RadioGroup
                value={data.stay_type}
                onValueChange={(v) => set("stay_type", v)}
                className="mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="short_term" id="req-stay-short" />
                  <Label htmlFor="req-stay-short" className="font-normal">
                    Short-term
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="long_term" id="req-stay-long" />
                  <Label htmlFor="req-stay-long" className="font-normal">
                    Long-term
                  </Label>
                </div>
              </RadioGroup>
              <FieldError message={errors.stay_type} />
            </div>

            {data.stay_type === "short_term" && (
              <div>
                <Label htmlFor="req-date-until">Until what date?</Label>
                <Input
                  id="req-date-until"
                  type="date"
                  value={data.date_until}
                  onChange={(e) => set("date_until", e.target.value)}
                />
                <FieldError message={errors.date_until} />
              </div>
            )}
          </WizardStep>
        )}

        {step === 3 && (
          <WizardStep title="Contract">
            <div>
              <Label>Would you need a registered contract?</Label>
              <RadioGroup
                value={data.needs_contract}
                onValueChange={(v) => set("needs_contract", v)}
                className="mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="req-contract-yes" />
                  <Label htmlFor="req-contract-yes" className="font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="req-contract-no" />
                  <Label htmlFor="req-contract-no" className="font-normal">
                    No, I just need a good space
                  </Label>
                </div>
              </RadioGroup>
              <FieldError message={errors.needs_contract} />
            </div>
          </WizardStep>
        )}

        {step === 4 && (
          <WizardStep title="Accommodation preferences">
            <div>
              <Label>What type of room are you looking for?</Label>
              <RadioGroup
                value={data.room_type}
                onValueChange={(v) => {
                  set("room_type", v);
                  // A studio has no shared bathroom/kitchen — nobody to ask about.
                  if (v === "studio") set("max_roommates", "1");
                  else if (data.max_roommates === "1") set("max_roommates", "");
                }}
                className="mt-2"
              >
                {ROOM_TYPES.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`req-room-${opt.value}`} />
                    <Label htmlFor={`req-room-${opt.value}`} className="font-normal">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <FieldError message={errors.room_type} />
            </div>

            <div className={cn("grid gap-4", data.room_type !== "studio" && "sm:grid-cols-2")}>
              <div>
                <Label htmlFor="req-budget">What is your monthly budget, including bills?</Label>
                <Select value={data.budget_range} onValueChange={(v) => set("budget_range", v)}>
                  <SelectTrigger id="req-budget" className="mt-1">
                    <SelectValue placeholder="Select a range" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGETS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.budget_range} />
              </div>
              {data.room_type !== "studio" && (
                <div>
                  <Label htmlFor="req-roommates">
                    Up to how many people are you comfortable sharing the bathroom/kitchen with?
                  </Label>
                  <Select value={data.max_roommates} onValueChange={(v) => set("max_roommates", v)}>
                    <SelectTrigger id="req-roommates" className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOMMATES.filter((r) => r !== "1").map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.max_roommates} />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="req-location">Location preferences</Label>
              <Textarea
                id="req-location"
                rows={3}
                value={data.location_preferences}
                onChange={(e) => set("location_preferences", e.target.value)}
                placeholder="Please describe your preferred area, nearby metro or bus stops, landmarks, university, workplace, or other location details."
              />
              <FieldError message={errors.location_preferences} />
            </div>

            <div>
              <Label htmlFor="req-notes">Any other notes we should know? (optional)</Label>
              <Textarea
                id="req-notes"
                rows={3}
                value={data.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-border p-3">
              <Checkbox
                id="req-consent"
                checked={data.consent}
                onCheckedChange={(v) => set("consent", v === true)}
              />
              <Label htmlFor="req-consent" className="font-normal text-sm">
                I agree to Milan Students Network storing and using my information to help match me
                with accommodation, in line with the privacy policy.
              </Label>
            </div>
            <FieldError message={errors.consent} />
          </WizardStep>
        )}
      </div>

      <WizardNav
        onBack={goBack}
        onNext={goNext}
        nextLabel={step === TOTAL_STEPS ? "Submit request" : "Next"}
        submitting={submitting}
      />
    </div>
  );
}

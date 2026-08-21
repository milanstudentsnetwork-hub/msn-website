import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { submitAccommodationListing } from "@/lib/submissions.functions";
import { formatSubmitError } from "@/lib/format-submit-error";
import { ProgressBar, WizardStep, WizardNav, FieldError } from "./WizardShell";
import { LocationPicker } from "./LocationPicker";
import { ImageUploader } from "./ImageUploader";
import { VideoUploader } from "./VideoUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ROOM_TYPES,
  RENTS,
  ROOMMATES,
  GENDER_PREFERENCES,
  CONTRACT_STATUSES,
  todayIso,
} from "@/lib/accommodation-options";

const TOTAL_STEPS = 4;
const MIN_LOCATION_DESCRIPTION_LENGTH = 3;

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  available_now: string;
  available_from: string;
  long_term: string;
  available_until: string;
  contract_status: string;
  contract_notes: string;
  room_type: string;
  rent_range: string;
  gender_preference: string;
  max_roommates: string;
  location_query: string;
  latitude: number | null;
  longitude: number | null;
  location_description: string;
  is_modern: string;
  additional_notes: string;
  images: string[];
  video_url: string;
  photo_consent: boolean;
  consent: boolean;
  honeypot: string;
};

const emptyForm: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  available_now: "",
  available_from: "",
  long_term: "",
  available_until: "",
  contract_status: "",
  contract_notes: "",
  room_type: "",
  rent_range: "",
  gender_preference: "",
  max_roommates: "",
  location_query: "",
  latitude: null,
  longitude: null,
  location_description: "",
  is_modern: "",
  additional_notes: "",
  images: [],
  video_url: "",
  photo_consent: false,
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
  }
  if (step === 2) {
    if (!data.available_now) errors.available_now = "Please select an option.";
    if (!data.available_from) errors.available_from = "Please choose a date.";
    if (!data.long_term) errors.long_term = "Please select an option.";
    if (data.long_term === "no" && !data.available_until) {
      errors.available_until = "Please choose an end date.";
    }
    if (!data.contract_status) errors.contract_status = "Please select an option.";
  }
  if (step === 3) {
    if (!data.room_type) errors.room_type = "Please select an option.";
    if (!data.rent_range) errors.rent_range = "Please select an option.";
    if (!data.gender_preference) errors.gender_preference = "Please select an option.";
    if (!data.max_roommates) errors.max_roommates = "Please select an option.";
    if (!data.location_query.trim()) errors.location_query = "Please search or set a location.";
    if (data.location_description.trim().length < MIN_LOCATION_DESCRIPTION_LENGTH) {
      errors.location_description = data.location_description.trim()
        ? `A bit more detail please — at least ${MIN_LOCATION_DESCRIPTION_LENGTH} characters.`
        : "Please describe the location.";
    }
    if (!data.is_modern) errors.is_modern = "Please select an option.";
  }
  if (step === 4) {
    if (data.images.length > 0 && !data.photo_consent) {
      errors.photo_consent = "Please confirm you have permission to share these photos.";
    }
    if (
      data.video_url.trim() &&
      !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(data.video_url.trim())
    ) {
      errors.video_url = "Please paste a YouTube video link (youtube.com or youtu.be).";
    }
    if (!data.consent) errors.consent = "Please confirm before submitting.";
  }
  return errors;
}

export function ListingFlow({ onBackToStart }: { onBackToStart: () => void }) {
  const submitFn = useServerFn(submitAccommodationListing);
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
          available_now: data.available_now === "yes",
          available_from: data.available_from,
          long_term: data.long_term === "yes",
          available_until: data.long_term === "no" ? data.available_until || null : null,
          contract_status: data.contract_status as "yes" | "no" | "explain",
          contract_notes: data.contract_notes.trim() || null,
          room_type: data.room_type as "studio" | "single_shared_flat" | "shared_bed",
          rent_range: data.rent_range as (typeof RENTS)[number],
          gender_preference: data.gender_preference as
            "male_only" | "female_only" | "no_preference",
          max_roommates: data.max_roommates as (typeof ROOMMATES)[number],
          location_query: data.location_query.trim(),
          latitude: data.latitude,
          longitude: data.longitude,
          location_description: data.location_description.trim(),
          is_modern: data.is_modern === "yes",
          additional_notes: data.additional_notes.trim() || null,
          images: data.images,
          video_url: data.video_url.trim() || null,
          photo_consent: data.photo_consent,
          honeypot: data.honeypot || undefined,
        },
      });
      setDone(true);
    } catch (err) {
      console.error("Listing submission failed", err);
      toast.error(`Something went wrong: ${formatSubmitError(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <h3 className="font-display text-xl font-semibold">
          Thank you, your accommodation listing has been registered.
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          You will receive a confirmation email at your registered email address. Our matching team
          will review the listing and contact you as soon as a suitable match is found.
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

      <div className="hidden" aria-hidden="true">
        <label htmlFor="listing-website">Website</label>
        <input
          id="listing-website"
          tabIndex={-1}
          autoComplete="off"
          value={data.honeypot}
          onChange={(e) => set("honeypot", e.target.value)}
        />
      </div>

      <div className="mt-6">
        {step === 1 && (
          <WizardStep title="Contact information">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="l-first-name">First name</Label>
                <Input
                  id="l-first-name"
                  value={data.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                />
                <FieldError message={errors.first_name} />
              </div>
              <div>
                <Label htmlFor="l-last-name">Surname</Label>
                <Input
                  id="l-last-name"
                  value={data.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                />
                <FieldError message={errors.last_name} />
              </div>
              <div>
                <Label htmlFor="l-email">Email address</Label>
                <Input
                  id="l-email"
                  type="email"
                  value={data.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                <FieldError message={errors.email} />
              </div>
              <div>
                <Label htmlFor="l-phone">Phone number</Label>
                <Input
                  id="l-phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                <FieldError message={errors.phone} />
              </div>
            </div>
          </WizardStep>
        )}

        {step === 2 && (
          <WizardStep title="Availability and contract">
            <div>
              <Label>Is the room currently available?</Label>
              <RadioGroup
                value={data.available_now}
                onValueChange={(v) => {
                  set("available_now", v);
                  // Available now means the start date is today — no need to ask.
                  set("available_from", v === "yes" ? todayIso() : "");
                }}
                className="mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="l-avail-yes" />
                  <Label htmlFor="l-avail-yes" className="font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="l-avail-no" />
                  <Label htmlFor="l-avail-no" className="font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
              <FieldError message={errors.available_now} />
            </div>

            {data.available_now === "no" && (
              <div>
                <Label htmlFor="l-avail-date">From what date will it be available?</Label>
                <Input
                  id="l-avail-date"
                  type="date"
                  value={data.available_from}
                  onChange={(e) => set("available_from", e.target.value)}
                />
                <FieldError message={errors.available_from} />
              </div>
            )}

            <div>
              <Label>Is the room available for long-term stay?</Label>
              <RadioGroup
                value={data.long_term}
                onValueChange={(v) => {
                  set("long_term", v);
                  if (v === "yes") set("available_until", "");
                }}
                className="mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="l-long-yes" />
                  <Label htmlFor="l-long-yes" className="font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="l-long-no" />
                  <Label htmlFor="l-long-no" className="font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
              <FieldError message={errors.long_term} />
            </div>

            {data.long_term === "no" && (
              <div>
                <Label htmlFor="l-avail-until">Until what date is it available?</Label>
                <Input
                  id="l-avail-until"
                  type="date"
                  value={data.available_until}
                  onChange={(e) => set("available_until", e.target.value)}
                />
                <FieldError message={errors.available_until} />
              </div>
            )}

            <div>
              <Label>Is a registered contract available during the stay?</Label>
              <RadioGroup
                value={data.contract_status}
                onValueChange={(v) => set("contract_status", v)}
                className="mt-2"
              >
                {CONTRACT_STATUSES.filter((opt) => opt.value !== "explain").map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`l-contract-${opt.value}`} />
                    <Label htmlFor={`l-contract-${opt.value}`} className="font-normal">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <FieldError message={errors.contract_status} />
            </div>

            {data.contract_status === "no" && (
              <div>
                <Label htmlFor="l-contract-notes">
                  Explain why / Is it possible to provide hospitality? (optional)
                </Label>
                <Textarea
                  id="l-contract-notes"
                  rows={3}
                  value={data.contract_notes}
                  onChange={(e) => set("contract_notes", e.target.value)}
                />
                <FieldError message={errors.contract_notes} />
              </div>
            )}
          </WizardStep>
        )}

        {step === 3 && (
          <WizardStep title="Listing details">
            <div>
              <Label>Type of room</Label>
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
                    <RadioGroupItem value={opt.value} id={`l-room-${opt.value}`} />
                    <Label htmlFor={`l-room-${opt.value}`} className="font-normal">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <FieldError message={errors.room_type} />
            </div>

            <div className={cn("grid gap-4", data.room_type !== "studio" && "sm:grid-cols-2")}>
              <div>
                <Label htmlFor="l-rent">What is the monthly rent, including bills?</Label>
                <Select value={data.rent_range} onValueChange={(v) => set("rent_range", v)}>
                  <SelectTrigger id="l-rent" className="mt-1">
                    <SelectValue placeholder="Select a range" />
                  </SelectTrigger>
                  <SelectContent>
                    {RENTS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.rent_range} />
              </div>
              {data.room_type !== "studio" && (
                <div>
                  <Label htmlFor="l-roommates">
                    How many people share the same bathroom/kitchen?
                  </Label>
                  <Select value={data.max_roommates} onValueChange={(v) => set("max_roommates", v)}>
                    <SelectTrigger id="l-roommates" className="mt-1">
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
              <Label>Gender preference</Label>
              <RadioGroup
                value={data.gender_preference}
                onValueChange={(v) => set("gender_preference", v)}
                className="mt-2"
              >
                {GENDER_PREFERENCES.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`l-gender-${opt.value}`} />
                    <Label htmlFor={`l-gender-${opt.value}`} className="font-normal">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <FieldError message={errors.gender_preference} />
            </div>

            <LocationPicker
              query={data.location_query}
              latitude={data.latitude}
              longitude={data.longitude}
              onChange={({ query, latitude, longitude }) => {
                set("location_query", query);
                set("latitude", latitude);
                set("longitude", longitude);
              }}
            />
            <FieldError message={errors.location_query} />

            <div>
              <Label htmlFor="l-location-desc">Describe the location</Label>
              <Textarea
                id="l-location-desc"
                rows={3}
                value={data.location_description}
                onChange={(e) => set("location_description", e.target.value)}
                placeholder="Tell us how far the accommodation is from the nearest metro station, bus station, university, or landmark."
              />
              {data.location_description.trim().length > 0 &&
                data.location_description.trim().length < MIN_LOCATION_DESCRIPTION_LENGTH && (
                  <p className="mt-1 text-xs text-destructive">
                    A bit more detail please — at least {MIN_LOCATION_DESCRIPTION_LENGTH} characters
                    ({data.location_description.trim().length} so far).
                  </p>
                )}
              <FieldError message={errors.location_description} />
            </div>

            <div>
              <Label>Is the room modern?</Label>
              <RadioGroup
                value={data.is_modern}
                onValueChange={(v) => set("is_modern", v)}
                className="mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="l-modern-yes" />
                  <Label htmlFor="l-modern-yes" className="font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="l-modern-no" />
                  <Label htmlFor="l-modern-no" className="font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
              <FieldError message={errors.is_modern} />
            </div>

            <div>
              <Label htmlFor="l-notes">Any other notes we should know? (optional)</Label>
              <Textarea
                id="l-notes"
                rows={3}
                value={data.additional_notes}
                onChange={(e) => set("additional_notes", e.target.value)}
              />
            </div>
          </WizardStep>
        )}

        {step === 4 && (
          <WizardStep
            title="Add photos"
            description="Upload up to 5 photos of the room or property. Photos are optional; you can upload them later if needed. We may use them on our social media channels if we cannot find a match immediately."
          >
            <ImageUploader value={data.images} onChange={(urls) => set("images", urls)} />

            <VideoUploader
              value={data.video_url}
              onChange={(url) => set("video_url", url)}
              title={`${ROOM_TYPES.find((r) => r.value === data.room_type)?.label || "Room"} in ${
                data.location_query || "Milan"
              }`}
            />
            <FieldError message={errors.video_url} />

            {data.images.length > 0 && (
              <div className="flex items-start gap-2 rounded-xl border border-border p-3">
                <Checkbox
                  id="l-photo-consent"
                  checked={data.photo_consent}
                  onCheckedChange={(v) => set("photo_consent", v === true)}
                />
                <Label htmlFor="l-photo-consent" className="font-normal text-sm">
                  I confirm that I have permission to share these photos and allow them to be used
                  to promote this accommodation listing.
                </Label>
              </div>
            )}
            <FieldError message={errors.photo_consent} />

            <div className="flex items-start gap-2 rounded-xl border border-border p-3">
              <Checkbox
                id="l-consent"
                checked={data.consent}
                onCheckedChange={(v) => set("consent", v === true)}
              />
              <Label htmlFor="l-consent" className="font-normal text-sm">
                I agree to Milan Students Network storing and using this information to review and
                publish this listing, in line with the privacy policy.
              </Label>
            </div>
            <FieldError message={errors.consent} />
          </WizardStep>
        )}
      </div>

      <WizardNav
        onBack={goBack}
        onNext={goNext}
        nextLabel={step === TOTAL_STEPS ? "Submit listing" : "Next"}
        submitting={submitting}
      />
    </div>
  );
}

// Single source of truth for the option sets used by both the "Post a listing"
// wizard (ListingFlow.tsx) and the public browse filters (routes/accommodation.tsx),
// so the filter bar always matches what the questionnaire actually collects.

export const ROOM_TYPES = [
  { value: "studio", label: "Studio / Monolocale" },
  { value: "single_shared_flat", label: "Single room in a shared flat" },
  { value: "shared_bed", label: "Shared bed space (sharing a room with another person)" },
] as const;

export const RENTS = [
  "Less than €400",
  "€400–€550",
  "€550–€700",
  "€700–€850",
  "More than €850",
] as const;

export const ROOMMATES = ["1", "2", "3", "4", "4+"] as const;

export const GENDER_PREFERENCES = [
  { value: "male_only", label: "Only for male" },
  { value: "female_only", label: "Only for female" },
  { value: "no_preference", label: "No preference, as long as the tenant can pay the rent" },
] as const;

export const CONTRACT_STATUSES = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "explain", label: "Explain why / Is it possible to provide hospitality?" },
] as const;

/** Today's date as YYYY-MM-DD, for auto-filling "available from"/"move in" dates
 * when the user says they need it immediately rather than asking them to pick it. */
export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Single source of truth for event categories, shared by the admin "Add Event"
// form and the public EventCard badge tint so the two never drift apart.

export const EVENT_CATEGORIES = [
  { value: "social", label: "Social" },
  { value: "welcome", label: "Welcome" },
  { value: "culture", label: "Culture" },
  { value: "sports", label: "Sports" },
  { value: "networking", label: "Networking" },
  { value: "nightlife", label: "Nightlife" },
] as const;

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];
export type ListingRow = Database["public"]["Tables"]["accommodation_listings"]["Row"];

export const listEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("events")
    .select("*")
    .eq("status", "published");
  if (error) throw new Error(error.message);

  // Recurring events store a fixed anchor date, not "today's" occurrence —
  // roll it forward here so every consumer sees the next upcoming date
  // without needing to know about recurrence itself. Ordering has to happen
  // after this, since a recurring event's DB-stored date can be arbitrarily
  // old relative to its rolled-forward display date.
  const { getEffectiveEventDate } = await import("./event-recurrence");
  const events = ((data ?? []) as EventRow[]).map((event) => ({
    ...event,
    event_date: getEffectiveEventDate(event),
  }));
  events.sort((a, b) => (a.event_date < b.event_date ? -1 : a.event_date > b.event_date ? 1 : 0));
  return events;
});

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("services")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ServiceRow[];
});

export const listFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("faqs")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as FaqRow[];
});

export const listListings = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("accommodation_listings")
    .select("*")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ListingRow[];
});

export const getListing = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => z.string().uuid().parse(id))
  .handler(async ({ data: id }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const { data, error } = await getPublicClient()
      .from("accommodation_listings")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ListingRow | null;
  });

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient().from("site_settings").select("key, value");
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value])) as Record<
    string,
    string
  >;
});

import { createServerFn } from "@tanstack/react-start";
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
    .eq("status", "published")
    .order("event_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as EventRow[];
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

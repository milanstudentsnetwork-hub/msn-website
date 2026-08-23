import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/integrations/supabase/require-admin";
import type { Database } from "@/integrations/supabase/types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];
type ListingRow = Database["public"]["Tables"]["accommodation_listings"]["Row"];
type RequestRow = Database["public"]["Tables"]["service_requests"]["Row"];
type MessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];
type SettingRow = Database["public"]["Tables"]["site_settings"]["Row"];
type ListingUpdate = Database["public"]["Tables"]["accommodation_listings"]["Update"];
type RequestUpdate = Database["public"]["Tables"]["service_requests"]["Update"];
type AccommodationRequestRow = Database["public"]["Tables"]["accommodation_requests"]["Row"];
type AccommodationRequestUpdate = Database["public"]["Tables"]["accommodation_requests"]["Update"];

// Drops explicit `undefined` values (as opposed to omitted keys) so partial
// update payloads satisfy exactOptionalPropertyTypes against Supabase's
// generated Update types, which don't accept `undefined` as a value.
function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export const checkAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => ({ ok: true as const }));

// ============ events ============
const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(160).nullable().default(null),
  description: z.string().trim().max(4000).default(""),
  event_date: z.string().trim().min(1),
  start_time: z.string().trim().max(20).nullable().default(null),
  end_time: z.string().trim().max(20).nullable().default(null),
  location: z.string().trim().max(200).default(""),
  category: z.string().trim().max(60).default("social"),
  cover_image_url: z.string().trim().max(2000).nullable().default(null),
  rsvp_url: z.string().trim().max(2000).nullable().default(null),
  capacity: z.number().int().nullable().default(null),
  price: z.number().min(0).default(0),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  sort_order: z.number().int().default(0),
});

export const adminListEvents = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as EventRow[];
  });

export const adminUpsertEvent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => eventSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { id, ...rest } = data;
    const query = id
      ? context.supabase.from("events").update(rest).eq("id", id)
      : context.supabase.from("events").insert(rest);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDuplicateEvent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: original, error: fetchError } = await context.supabase
      .from("events")
      .select("*")
      .eq("id", data.id)
      .single();
    if (fetchError) throw new Error(fetchError.message);
    const { id: _id, created_at: _c, updated_at: _u, slug: _slug, ...rest } = original;
    const { error } = await context.supabase
      .from("events")
      .insert({ ...rest, title: `${rest.title} (Copy)`, status: "draft", is_featured: false });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteEvent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ============ services ============
const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(160).nullable().default(null),
  short_description: z.string().trim().max(300).default(""),
  full_description: z.string().trim().max(4000).default(""),
  category: z.string().trim().max(60).default("support"),
  icon_key: z.string().trim().max(60).nullable().default(null),
  image_url: z.string().trim().max(2000).nullable().default(null),
  is_paid: z.boolean().default(false),
  price: z.number().min(0).nullable().default(null),
  price_note: z.string().trim().max(120).nullable().default(null),
  booking_url: z.string().trim().max(2000).nullable().default(null),
  cta_label: z.string().trim().max(60).default("Request This Service"),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  sort_order: z.number().int().default(0),
});

export const adminListServices = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as ServiceRow[];
  });

export const adminUpsertService = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => serviceSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { id, ...rest } = data;
    const query = id
      ? context.supabase.from("services").update(rest).eq("id", id)
      : context.supabase.from("services").insert(rest);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteService = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ============ faqs ============
const faqSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().trim().min(2).max(300),
  answer: z.string().trim().min(2).max(4000),
  category: z.string().trim().max(60).default("general"),
  status: z.enum(["draft", "published"]).default("draft"),
  sort_order: z.number().int().default(0),
});

export const adminListFaqs = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as FaqRow[];
  });

export const adminUpsertFaq = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => faqSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { id, ...rest } = data;
    const query = id
      ? context.supabase.from("faqs").update(rest).eq("id", id)
      : context.supabase.from("faqs").insert(rest);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteFaq = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("faqs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ============ accommodation listings ============
const listingUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(4000).optional(),
  price: z.number().min(0).optional(),
  neighborhood: z.string().trim().max(120).optional(),
  room_type: z.string().trim().max(60).optional(),
  is_featured: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  status: z.enum(["pending", "approved", "rejected", "published", "matched", "closed"]).optional(),
  admin_notes: z.string().trim().max(2000).nullable().optional(),
});

export const adminListListings = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("accommodation_listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ListingRow[];
  });

export const adminUpdateListing = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => listingUpdateSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { id, ...rest } = data;

    let previousStatus: string | null = null;
    if (rest.status === "published") {
      const { data: existing } = await context.supabase
        .from("accommodation_listings")
        .select("status")
        .eq("id", id)
        .maybeSingle();
      previousStatus = existing?.status ?? null;
    }

    const { data: updated, error } = await context.supabase
      .from("accommodation_listings")
      .update(stripUndefined(rest) as ListingUpdate)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Only announce the pending/approved/rejected -> published transition,
    // never re-fire on later edits to an already-published listing.
    if (rest.status === "published" && previousStatus !== "published") {
      const { data: setting } = await context.supabase
        .from("site_settings")
        .select("value")
        .eq("key", "telegram_accommodation_url")
        .maybeSingle();
      const channelUrl = setting?.value;
      const listing = updated as ListingRow;
      if (channelUrl) {
        const { notifyTelegramChannel, formatListingAnnouncement } =
          await import("./telegram.server");
        await notifyTelegramChannel(channelUrl, formatListingAnnouncement(listing), listing.images);
      }
      const { postListingToFacebook, postListingToInstagram, formatListingCaption } =
        await import("./meta.server");
      const caption = formatListingCaption(listing);
      await Promise.all([
        postListingToFacebook(caption, listing.images),
        postListingToInstagram(caption, listing.images),
      ]);
    }

    return { ok: true as const };
  });

export const adminDeleteListing = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("accommodation_listings")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ============ service requests ============
const requestUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z
    .enum(["new", "contacted", "in_progress", "awaiting_payment", "paid", "completed", "cancelled"])
    .optional(),
  quoted_price: z.number().min(0).nullable().optional(),
  payment_url: z.string().trim().max(2000).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const adminListRequests = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as RequestRow[];
  });

export const adminUpdateRequest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => requestUpdateSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { id, ...rest } = data;
    const { error } = await context.supabase
      .from("service_requests")
      .update(stripUndefined(rest) as RequestUpdate)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteRequest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("service_requests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ============ contact messages ============
export const adminListMessages = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as MessageRow[];
  });

export const adminMarkMessageRead = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), is_read: z.boolean() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("contact_messages")
      .update({ is_read: data.is_read })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteMessage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("contact_messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ============ site settings ============
export const adminListSettings = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("site_settings")
      .select("*")
      .order("key", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as SettingRow[];
  });

export const adminUpsertSetting = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) =>
    z.object({ key: z.string().trim().min(1).max(80), value: z.string().max(4000) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("site_settings")
      .upsert(data, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ============ accommodation requests ("looking for accommodation") ============
const accommodationRequestUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "under_review", "matched", "closed"]).optional(),
});

export const adminListAccommodationRequests = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("accommodation_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AccommodationRequestRow[];
  });

export const adminUpdateAccommodationRequest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => accommodationRequestUpdateSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { id, ...rest } = data;
    const { error } = await context.supabase
      .from("accommodation_requests")
      .update(stripUndefined(rest) as AccommodationRequestUpdate)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteAccommodationRequest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("accommodation_requests")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

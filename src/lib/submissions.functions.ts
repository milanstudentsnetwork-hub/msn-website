import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Representative lower-bound value per budget bucket, used only for sorting —
// rent_range/budget_range holds the label shown to users.
const BUDGET_BUCKET_VALUE: Record<string, number> = {
  "Less than €400": 350,
  "€400–€550": 400,
  "€550–€700": 550,
  "€700–€850": 700,
  "More than €850": 850,
};

const ROOM_TYPES = ["studio", "single_shared_flat", "shared_bed"] as const;

// ============ Flow A: looking for accommodation ============
const accommodationRequestSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100),
    last_name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(3).max(40),
    gender: z.enum(["male", "female", "prefer_not_to_say"]),
    move_immediately: z.boolean(),
    stay_type: z.enum(["short_term", "long_term"]),
    date_from: z.string().trim().max(30).nullable().default(null),
    date_until: z.string().trim().max(30).nullable().default(null),
    needs_contract: z.boolean(),
    room_type: z.enum(ROOM_TYPES),
    budget_range: z.enum([
      "Less than €400",
      "€400–€550",
      "€550–€700",
      "€700–€850",
      "More than €850",
    ]),
    max_roommates: z.enum(["2", "3", "4", "4+"]),
    location_preferences: z.string().trim().min(3).max(1000),
    notes: z.string().trim().max(2000).nullable().default(null),
    honeypot: z.string().max(0).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.stay_type === "short_term" && !val.date_until) {
      ctx.addIssue({
        code: "custom",
        path: ["date_until"],
        message: "Please give an end date for a short-term stay.",
      });
    }
  });

export const submitAccommodationRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => accommodationRequestSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.honeypot) return { ok: true as const };
    const { honeypot: _honeypot, ...row } = data;

    const { getPublicClient } = await import("./supabase-public.server");
    const { error } = await getPublicClient().from("accommodation_requests").insert(row);
    if (error) throw new Error(error.message);

    // The row is already saved — a confirmation-email hiccup shouldn't make the
    // client think the whole submission failed and risk a duplicate resubmit.
    try {
      const { sendAccommodationRequestEmails } = await import("./email.server");
      await sendAccommodationRequestEmails({
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        roomType: row.room_type,
        budgetRange: row.budget_range,
        stayType: row.stay_type,
      });
    } catch (err) {
      console.error("[submitAccommodationRequest] confirmation email failed", err);
    }

    return { ok: true as const };
  });

// ============ Flow B: post a listing ============
const accommodationListingSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100),
    last_name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(3).max(40),
    available_now: z.boolean(),
    available_from: z.string().trim().max(30),
    long_term: z.boolean(),
    contract_status: z.enum(["yes", "no", "explain"]),
    contract_notes: z.string().trim().max(1000).nullable().default(null),
    room_type: z.enum(ROOM_TYPES),
    rent_range: z.enum(["Less than €400", "€400–€550", "€550–€700", "€700–€850", "More than €850"]),
    gender_preference: z.enum(["male_only", "female_only", "no_preference"]),
    max_roommates: z.enum(["2", "3", "4", "4+"]),
    location_query: z.string().trim().min(2).max(200),
    latitude: z.number().nullable().default(null),
    longitude: z.number().nullable().default(null),
    location_description: z.string().trim().min(3).max(1000),
    is_modern: z.boolean(),
    additional_notes: z.string().trim().max(2000).nullable().default(null),
    images: z.array(z.string().trim().url()).max(5).default([]),
    photo_consent: z.boolean(),
    honeypot: z.string().max(0).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.contract_status === "explain" && !val.contract_notes) {
      ctx.addIssue({
        code: "custom",
        path: ["contract_notes"],
        message: "Please explain the contract situation.",
      });
    }
    if (val.images.length > 0 && !val.photo_consent) {
      ctx.addIssue({
        code: "custom",
        path: ["photo_consent"],
        message: "Please confirm you have permission to share these photos.",
      });
    }
  });

export const submitAccommodationListing = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => accommodationListingSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.honeypot) return { ok: true as const };

    const roomTypeLabel: Record<string, string> = {
      studio: "Studio",
      single_shared_flat: "Single room in a shared flat",
      shared_bed: "Shared bed space",
    };
    const title = `${roomTypeLabel[data.room_type]} in ${data.location_query}`;
    const description = [data.location_description, data.additional_notes]
      .filter(Boolean)
      .join("\n\n");

    const { getPublicClient } = await import("./supabase-public.server");
    const { error } = await getPublicClient()
      .from("accommodation_listings")
      .insert({
        title,
        description,
        first_name: data.first_name,
        last_name: data.last_name,
        contact_name: `${data.first_name} ${data.last_name}`,
        contact_email: data.email,
        contact_phone: data.phone,
        available_now: data.available_now,
        available_from: data.available_from,
        long_term: data.long_term,
        contract_status: data.contract_status,
        contract_notes: data.contract_notes,
        room_type: data.room_type,
        neighborhood: data.location_query,
        rent_range: data.rent_range,
        price: BUDGET_BUCKET_VALUE[data.rent_range] ?? 0,
        gender_preference: data.gender_preference,
        max_roommates: data.max_roommates,
        latitude: data.latitude,
        longitude: data.longitude,
        location_description: data.location_description,
        is_modern: data.is_modern,
        additional_notes: data.additional_notes,
        images: data.images,
        photo_consent: data.photo_consent,
        listing_source: "landlord",
        status: "pending",
      });
    if (error) throw new Error(error.message);

    // The row is already saved — a confirmation-email hiccup shouldn't make the
    // client think the whole submission failed and risk a duplicate resubmit.
    try {
      const { sendAccommodationListingEmails } = await import("./email.server");
      await sendAccommodationListingEmails({
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        title,
        neighborhood: data.location_query,
      });
    } catch (err) {
      console.error("[submitAccommodationListing] confirmation email failed", err);
    }

    return { ok: true as const };
  });

const contactSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(140),
  message: z.string().trim().min(10).max(2000),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const { error } = await getPublicClient().from("contact_messages").insert(data);
    if (error) throw new Error(error.message);

    // The row is already saved — a confirmation-email hiccup shouldn't make the
    // client think the whole submission failed and risk a duplicate resubmit.
    try {
      const { sendContactMessageEmails } = await import("./email.server");
      await sendContactMessageEmails({
        fullName: data.full_name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });
    } catch (err) {
      console.error("[submitContactMessage] confirmation email failed", err);
    }

    return { ok: true as const };
  });

const serviceRequestSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).nullable().default(null),
  university: z.string().trim().max(120).nullable().default(null),
  service_id: z.string().uuid().nullable().default(null),
  service_name: z.string().trim().min(2).max(140),
  details: z.string().trim().max(2000).default(""),
});

export const submitServiceRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => serviceRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const { error } = await getPublicClient().from("service_requests").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

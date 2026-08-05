import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const listingSchema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(20).max(2000),
  neighborhood: z.string().trim().min(2).max(80),
  room_type: z.string().trim().min(2).max(40),
  price: z.number().min(0).max(100000),
  price_period: z.string().trim().max(20).default("month"),
  bills_included: z.boolean().default(false),
  furnished: z.boolean().default(false),
  students_only: z.boolean().default(true),
  available_from: z.string().trim().max(30).nullable().default(null),
  contact_name: z.string().trim().min(2).max(100),
  contact_email: z.string().trim().email().max(255),
  contact_phone: z.string().trim().max(40).nullable().default(null),
  address_note: z.string().trim().max(300).nullable().default(null),
  listing_source: z.enum(["landlord", "student_upload"]),
});

export const submitListing = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => listingSchema.parse(data))
  .handler(async ({ data }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const { error } = await getPublicClient()
      .from("accommodation_listings")
      .insert({ ...data, status: "pending" });
    if (error) throw new Error(error.message);
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

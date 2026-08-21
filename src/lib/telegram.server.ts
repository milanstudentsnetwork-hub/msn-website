import type { Database } from "@/integrations/supabase/types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type ListingRow = Database["public"]["Tables"]["accommodation_listings"]["Row"];

const SITE_URL = "https://milan-sn.it";
const RESULT_LIMIT = 5;

export async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) {
    console.error("[telegram] Missing TELEGRAM_BOT_TOKEN");
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    console.error("[telegram] sendMessage failed", res.status, await res.text());
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Public t.me links only (t.me/YourChannel) — private invite links (t.me/+hash)
// can't be used as a chat_id for bot-initiated posts.
function extractChannelChatId(channelUrl: string): string | null {
  const match = channelUrl.match(/t\.me\/([a-zA-Z0-9_]+)\/?$/);
  return match ? `@${match[1]}` : null;
}

// Telegram's sendMediaGroup only accepts 2-10 items; a single photo has to go
// through sendPhoto instead, and zero photos falls back to a plain text post.
const MAX_MEDIA_GROUP_PHOTOS = 10;

export async function notifyTelegramChannel(
  channelUrl: string,
  text: string,
  photoUrls: string[] = [],
) {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) {
    console.error("[telegram] Missing TELEGRAM_BOT_TOKEN, skipping channel post");
    return;
  }
  const chatId = extractChannelChatId(channelUrl);
  if (!chatId) {
    console.error("[telegram] Could not derive a public @channel from", channelUrl);
    return;
  }

  const photos = photoUrls.slice(0, MAX_MEDIA_GROUP_PHOTOS);
  let endpoint: string;
  let body: Record<string, unknown>;

  if (photos.length >= 2) {
    endpoint = "sendMediaGroup";
    body = {
      chat_id: chatId,
      // Only the first item's caption is shown by Telegram for the whole album.
      media: photos.map((photo, i) => ({
        type: "photo",
        media: photo,
        ...(i === 0 ? { caption: text, parse_mode: "HTML" } : {}),
      })),
    };
  } else if (photos.length === 1) {
    endpoint = "sendPhoto";
    body = { chat_id: chatId, photo: photos[0], caption: text, parse_mode: "HTML" };
  } else {
    endpoint = "sendMessage";
    body = { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("[telegram] channel post failed", res.status, await res.text());
  }
}

const ROOM_TYPE_LABEL: Record<string, string> = {
  studio: "Studio / Monolocale",
  single_shared_flat: "Single room in a shared flat",
  shared_bed: "Shared bed space",
};

const GENDER_LABEL: Record<string, string> = {
  male_only: "Male only",
  female_only: "Female only",
  no_preference: "No gender preference",
};

export function formatListingAnnouncement(listing: ListingRow): string {
  const price = listing.rent_range || `€${listing.price}/${listing.price_period}`;
  const roomType = ROOM_TYPE_LABEL[listing.room_type] ?? listing.room_type;
  const description =
    listing.description.length > 300
      ? `${listing.description.slice(0, 300)}…`
      : listing.description;

  const details = [
    `💶 ${price}`,
    `🚪 ${roomType}`,
    listing.gender_preference && GENDER_LABEL[listing.gender_preference]
      ? `🚻 ${GENDER_LABEL[listing.gender_preference]}`
      : null,
    `👥 Up to ${listing.max_roommates} sharing`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    `🏠 <b>New listing: ${escapeHtml(listing.title)}</b>\n\n` +
    `📍 ${escapeHtml(listing.neighborhood)}\n` +
    `${details}\n\n` +
    `${escapeHtml(description)}\n\n` +
    `Full details: ${SITE_URL}/accommodation/${listing.id}`
  );
}

function formatEventDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export const WELCOME_TEXT =
  "<b>Milan Students Network</b>\n\n" +
  "I can look up what's live on the site right now:\n\n" +
  "/accommodation — latest published rooms\n" +
  "/events — upcoming events\n" +
  "/services — student services\n\n" +
  `Full details always at ${SITE_URL}`;

export async function formatEventsReply(): Promise<string> {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("event_date", new Date().toISOString().slice(0, 10))
    .order("event_date", { ascending: true })
    .limit(RESULT_LIMIT);

  if (error || !data?.length) {
    return `No upcoming events published yet. Check ${SITE_URL}/events soon.`;
  }

  const lines = (data as EventRow[]).map((event) => {
    const when =
      formatEventDate(event.event_date) + (event.start_time ? `, ${event.start_time}` : "");
    return `• <b>${escapeHtml(event.title)}</b>\n  ${when} — ${escapeHtml(event.location || "TBA")}`;
  });

  return `<b>Upcoming events</b>\n\n${lines.join("\n\n")}\n\nAll events: ${SITE_URL}/events`;
}

export async function formatServicesReply(): Promise<string> {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("services")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(RESULT_LIMIT);

  if (error || !data?.length) {
    return `No services published yet. Check ${SITE_URL}/services soon.`;
  }

  const lines = (data as ServiceRow[]).map((service) => {
    const price = service.is_paid ? `€${service.price ?? "?"}` : "Free";
    return `• <b>${escapeHtml(service.name)}</b> (${price})\n  ${escapeHtml(service.short_description)}`;
  });

  return `<b>Student services</b>\n\n${lines.join("\n\n")}\n\nAll services: ${SITE_URL}/services`;
}

export async function formatAccommodationReply(): Promise<string> {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("accommodation_listings")
    .select("*")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(RESULT_LIMIT);

  if (error || !data?.length) {
    return `No listings published yet. Check ${SITE_URL}/accommodation soon.`;
  }

  const lines = (data as ListingRow[]).map((listing) => {
    return (
      `• <b>${escapeHtml(listing.title)}</b>\n` +
      `  €${listing.price}/${listing.price_period} — ${escapeHtml(listing.neighborhood)} (${escapeHtml(listing.room_type)})`
    );
  });

  return `<b>Latest rooms</b>\n\n${lines.join("\n\n")}\n\nAll listings: ${SITE_URL}/accommodation`;
}

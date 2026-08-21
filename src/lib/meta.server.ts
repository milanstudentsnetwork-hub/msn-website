import type { Database } from "@/integrations/supabase/types";

type ListingRow = Database["public"]["Tables"]["accommodation_listings"]["Row"];

const SITE_URL = "https://milan-sn.it";
const GRAPH_API = "https://graph.facebook.com/v21.0";

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

export function formatListingCaption(listing: ListingRow): string {
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
    `🏠 New listing: ${listing.title}\n\n` +
    `📍 ${listing.neighborhood}\n` +
    `${details}\n\n` +
    `${description}\n\n` +
    (listing.video_url ? `🎥 Video walkthrough: ${listing.video_url}\n` : "") +
    `Full details: ${SITE_URL}/accommodation/${listing.id}`
  );
}

function getMetaConfig() {
  const accessToken = process.env["META_SYSTEM_USER_TOKEN"];
  const pageId = process.env["META_PAGE_ID"];
  const igUserId = process.env["META_IG_USER_ID"];
  if (!accessToken || !pageId || !igUserId) return null;
  return { accessToken, pageId, igUserId };
}

async function graphPost(path: string, params: Record<string, string>) {
  const res = await fetch(`${GRAPH_API}/${path}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const data = (await res.json()) as { id?: string; error?: { message: string } };
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Graph API request to ${path} failed (${res.status})`);
  }
  return data;
}

export async function postListingToFacebook(caption: string, photoUrls: string[] = []) {
  const config = getMetaConfig();
  if (!config) {
    console.error("[meta] Missing META_SYSTEM_USER_TOKEN / META_PAGE_ID, skipping Facebook post");
    return;
  }
  const { pageId } = config;

  try {
    // Posting to a Page's /photos or /feed requires the Page's own access
    // token — the System User token that works for Instagram gets rejected
    // here with a misleading "publish_actions deprecated" error instead.
    const pageInfo = await fetch(
      `${GRAPH_API}/${pageId}?fields=access_token&access_token=${config.accessToken}`,
    ).then((res) => res.json() as Promise<{ access_token?: string; error?: { message: string } }>);
    if (!pageInfo.access_token) {
      throw new Error(pageInfo.error?.message || "Could not resolve the Page access token.");
    }
    const accessToken = pageInfo.access_token;

    if (photoUrls.length === 0) {
      await graphPost(`${pageId}/feed`, { message: caption, access_token: accessToken });
    } else if (photoUrls.length === 1) {
      await graphPost(`${pageId}/photos`, {
        url: photoUrls[0]!,
        caption,
        access_token: accessToken,
      });
    } else {
      const uploaded = await Promise.all(
        photoUrls.map((url) =>
          graphPost(`${pageId}/photos`, { url, published: "false", access_token: accessToken }),
        ),
      );
      await graphPost(`${pageId}/feed`, {
        message: caption,
        attached_media: JSON.stringify(uploaded.map((p) => ({ media_fbid: p.id }))),
        access_token: accessToken,
      });
    }
  } catch (err) {
    console.error("[meta] Facebook post failed", err instanceof Error ? err.message : err);
  }
}

// Instagram fetches and validates the image asynchronously after a media
// container is created — publishing before that finishes fails with "Media ID
// is not available", so poll status_code until it reports FINISHED.
async function waitForMediaReady(containerId: string, accessToken: string) {
  for (let attempt = 0; attempt < 15; attempt++) {
    const res = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code&access_token=${accessToken}`,
    );
    const data = (await res.json()) as { status_code?: string; error?: { message: string } };
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") {
      throw new Error(data.error?.message || `Media container ${containerId} failed processing.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Media container ${containerId} never finished processing.`);
}

// Instagram's Content Publishing API can't post text-only — a listing with no
// photos is simply skipped there (it still goes out on Facebook/Telegram).
export async function postListingToInstagram(caption: string, photoUrls: string[] = []) {
  const config = getMetaConfig();
  if (!config) {
    console.error(
      "[meta] Missing META_SYSTEM_USER_TOKEN / META_IG_USER_ID, skipping Instagram post",
    );
    return;
  }
  if (photoUrls.length === 0) return;
  const { accessToken, igUserId } = config;

  try {
    // Instagram rejects images outside roughly a 4:5–1.91:1 aspect ratio
    // (unlike Facebook/Telegram, which accept anything) — probe each photo
    // as a carousel-item container and drop the ones it refuses, rather than
    // letting one bad photo sink the whole post.
    const settled = await Promise.allSettled(
      photoUrls.slice(0, 10).map(async (url) => {
        const child = await graphPost(`${igUserId}/media`, {
          image_url: url,
          is_carousel_item: "true",
          access_token: accessToken,
        });
        await waitForMediaReady(child.id!, accessToken);
        return { url, id: child.id! };
      }),
    );
    const usable = settled.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    for (const r of settled) {
      if (r.status === "rejected") {
        console.error("[meta] Instagram dropped a photo:", r.reason);
      }
    }
    if (usable.length === 0) {
      console.error("[meta] No Instagram-compatible photos for this listing, skipping post");
      return;
    }

    let creationId: string;
    if (usable.length === 1) {
      // A container made with is_carousel_item can't be published standalone —
      // recreate the one surviving photo as a regular single-image container.
      const container = await graphPost(`${igUserId}/media`, {
        image_url: usable[0]!.url,
        caption,
        access_token: accessToken,
      });
      creationId = container.id!;
      await waitForMediaReady(creationId, accessToken);
    } else {
      const container = await graphPost(`${igUserId}/media`, {
        media_type: "CAROUSEL",
        children: usable.map((c) => c.id).join(","),
        caption,
        access_token: accessToken,
      });
      creationId = container.id!;
      await waitForMediaReady(creationId, accessToken);
    }
    await graphPost(`${igUserId}/media_publish`, {
      creation_id: creationId,
      access_token: accessToken,
    });
  } catch (err) {
    console.error("[meta] Instagram post failed", err instanceof Error ? err.message : err);
  }
}

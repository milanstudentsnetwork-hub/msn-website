import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
] as const;
const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500MB

const requestSchema = z.object({
  title: z.string().trim().min(1).max(100),
  contentType: z.enum(ALLOWED_VIDEO_TYPES),
  fileSizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_VIDEO_BYTES, "Video is too large (max 500MB)."),
});

/** Initiates a resumable upload session directly with YouTube and hands the
 * browser a short-lived access token + session URL so it can PUT the video
 * bytes straight to Google — our own server never sees the video data
 * (Vercel functions can't handle multi-hundred-MB request bodies anyway). */
export const getVideoUploadSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { getYoutubeAccessToken } = await import("./youtube.server");
      const accessToken = await getYoutubeAccessToken();

      const res = await fetch(
        "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Length": String(data.fileSizeBytes),
            "X-Upload-Content-Type": data.contentType,
          },
          body: JSON.stringify({
            snippet: {
              title: data.title,
              description: "Listing video walkthrough — Milan Students Network",
              categoryId: "22",
            },
            status: {
              privacyStatus: "unlisted",
              selfDeclaredMadeForKids: false,
            },
          }),
        },
      );

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`YouTube session init failed: ${res.status} ${body}`);
      }

      const uploadUrl = res.headers.get("Location");
      if (!uploadUrl) throw new Error("YouTube did not return an upload session URL.");

      return { uploadUrl, accessToken };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Video upload setup failed: ${message}`);
    }
  });

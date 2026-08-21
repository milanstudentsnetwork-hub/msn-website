import { createFileRoute } from "@tanstack/react-router";

// YouTube's upload API has no CORS support, so the browser can't PUT video
// bytes to Google directly — this relays one chunk at a time server-side,
// small enough to stay under Vercel's request body limit. Google's resumable
// protocol returns 308 (not a real redirect) between chunks, which `fetch`
// would otherwise try to follow, so redirect handling is disabled below.
export const Route = createFileRoute("/api/video-upload-chunk")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const uploadUrl = request.headers.get("x-upload-url");
        const contentRange = request.headers.get("x-content-range");
        const contentType = request.headers.get("x-content-type") || "application/octet-stream";

        if (!uploadUrl || !contentRange) {
          return new Response(
            JSON.stringify({ error: "Missing x-upload-url or x-content-range" }),
            {
              status: 400,
            },
          );
        }
        // Only ever relay to Google's own upload endpoint, never an arbitrary URL.
        if (!uploadUrl.startsWith("https://www.googleapis.com/upload/youtube/")) {
          return new Response(JSON.stringify({ error: "Invalid upload URL" }), { status: 400 });
        }

        try {
          const chunk = await request.arrayBuffer();
          const { getYoutubeAccessToken } = await import("@/lib/youtube.server");
          const accessToken = await getYoutubeAccessToken();

          const googleRes = await fetch(uploadUrl, {
            method: "PUT",
            redirect: "manual",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Range": contentRange,
              "Content-Type": contentType,
              "Content-Length": String(chunk.byteLength),
            },
            body: chunk,
          });

          const text = await googleRes.text().catch(() => "");
          const range = googleRes.headers.get("range");
          return new Response(text, {
            status: googleRes.status,
            headers: {
              "Content-Type": googleRes.headers.get("content-type") || "application/json",
              ...(range ? { "x-range": range } : {}),
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[video-upload-chunk] relay failed", message);
          return new Response(JSON.stringify({ error: message }), { status: 502 });
        }
      },
    },
  },
});

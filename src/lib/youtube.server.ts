function getYoutubeConfig() {
  const clientId = process.env["YOUTUBE_CLIENT_ID"];
  const clientSecret = process.env["YOUTUBE_CLIENT_SECRET"];
  const refreshToken = process.env["YOUTUBE_REFRESH_TOKEN"];
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "YouTube upload is not configured (missing YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET / YOUTUBE_REFRESH_TOKEN)",
    );
  }
  return { clientId, clientSecret, refreshToken };
}

/** Exchanges the stored long-lived refresh token for a short-lived access token.
 * Called fresh on every upload request rather than cached, since tokens are
 * only valid ~1 hour and this endpoint has no meaningful rate limit concern here. */
export async function getYoutubeAccessToken() {
  const { clientId, clientSecret, refreshToken } = getYoutubeConfig();

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to refresh YouTube access token: ${res.status} ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  return data.access_token;
}

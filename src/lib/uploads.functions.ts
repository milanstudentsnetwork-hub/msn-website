import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const requestSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  contentType: z.enum(ALLOWED_TYPES),
});

/** Issues a short-lived presigned PUT URL so the browser can upload a listing
 * photo directly to R2 without ever seeing the storage credentials. */
export const getListingPhotoUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const { getR2Client, getR2Config } = await import("./r2-storage.server");

    const client = getR2Client();
    const { bucket, publicBaseUrl } = getR2Config();

    const ext = data.fileName.split(".").pop()?.toLowerCase() || "jpg";
    const key = `listings/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: data.contentType,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

    return { uploadUrl, publicUrl: `${publicBaseUrl}/${key}` };
  });

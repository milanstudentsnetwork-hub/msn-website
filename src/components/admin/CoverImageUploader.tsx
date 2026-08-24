import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, X } from "lucide-react";
import { getListingPhotoUploadUrl } from "@/lib/uploads.functions";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function CoverImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getUploadUrl = useServerFn(getListingPhotoUploadUrl);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(`"${file.name}" is over 10MB.`);
      return;
    }

    setUploading(true);
    try {
      const imageCompression = (await import("browser-image-compression")).default;
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type,
      });

      const contentType = file.type === "image/jpg" ? "image/jpeg" : file.type;
      const { uploadUrl, publicUrl } = await getUploadUrl({
        data: {
          fileName: file.name,
          contentType: contentType as "image/jpeg" | "image/png" | "image/webp",
          folder: "events",
        },
      });

      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: compressed,
        headers: { "Content-Type": contentType },
      });
      if (!putResponse.ok) {
        const body = await putResponse.text().catch(() => "");
        console.error("R2 upload failed", putResponse.status, body);
        setError(`Couldn't upload "${file.name}" (${putResponse.status}). Try again.`);
        return;
      }

      onChange(publicUrl);
    } catch (err) {
      console.error("Photo processing failed", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Couldn't process "${file.name}": ${message}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (value) {
    return (
      <div>
        <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border">
          <img src={value} alt="Cover" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove cover image"
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
      >
        {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        <span className="text-xs">{uploading ? "Uploading…" : "Upload cover image"}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Recommended 1600×1000px (16:10). JPG, PNG, or WEBP, 10MB max. Optional.
      </p>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, X } from "lucide-react";
import { getListingPhotoUploadUrl } from "@/lib/uploads.functions";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getUploadUrl = useServerFn(getListingPhotoUploadUrl);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);
    const remainingSlots = MAX_IMAGES - value.length;
    if (files.length > remainingSlots) {
      setError(`You can add up to ${MAX_IMAGES} photos — ${remainingSlots} slot(s) left.`);
    }
    const toProcess = files.slice(0, Math.max(remainingSlots, 0));

    for (const file of toProcess) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, and WEBP images are allowed.");
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`"${file.name}" is over 10MB.`);
        continue;
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
          data: { fileName: file.name, contentType: contentType as "image/jpeg" | "image/png" | "image/webp" },
        });

        const putResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: compressed,
          headers: { "Content-Type": contentType },
        });
        if (!putResponse.ok) {
          setError(`Couldn't upload "${file.name}". Try again.`);
          continue;
        }

        onChange([...value, publicUrl]);
      } catch {
        setError(`Couldn't process "${file.name}". Try a different photo.`);
      } finally {
        setUploading(false);
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {value.map((url, index) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
            <img src={url} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Remove photo"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-accent hover:text-foreground",
            )}
          >
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            <span className="text-xs">{uploading ? "Uploading…" : "Add photo"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-2 text-xs text-muted-foreground">
        Up to {MAX_IMAGES} photos, JPG/PNG/WEBP, 10MB max each. Optional — you can add them later.
      </p>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

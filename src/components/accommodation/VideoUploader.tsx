import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Film, Link2, Loader2, X } from "lucide-react";
import { getVideoUploadSession } from "@/lib/video-uploads.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_FILE_BYTES = 500 * 1024 * 1024; // 500MB
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];
// Matches the server's title max(100) — room-type + full geocoded address can easily run over.
const MAX_TITLE_LENGTH = 100;

type YoutubeVideoResource = { id: string };

function uploadWithProgress(
  url: string,
  file: File,
  accessToken: string,
  onProgress: (fraction: number) => void,
): Promise<YoutubeVideoResource> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as YoutubeVideoResource);
        } catch {
          reject(new Error("Couldn't read the response from YouTube."));
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText.slice(0, 200)}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
}

export function VideoUploader({
  value,
  onChange,
  title,
}: {
  value: string;
  onChange: (url: string) => void;
  title: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const getSession = useServerFn(getVideoUploadSession);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only MP4, MOV, WEBM, and AVI videos are allowed.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Video is too large — 500MB max.");
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const rawTitle = title || file.name;
      const { uploadUrl, accessToken } = await getSession({
        data: {
          title:
            rawTitle.length > MAX_TITLE_LENGTH
              ? `${rawTitle.slice(0, MAX_TITLE_LENGTH - 1)}…`
              : rawTitle,
          contentType: file.type as (typeof ACCEPTED_TYPES)[number],
          fileSizeBytes: file.size,
        },
      });
      const video = await uploadWithProgress(uploadUrl, file, accessToken, setProgress);
      onChange(`https://youtu.be/${video.id}`);
    } catch (err) {
      console.error("Video upload failed", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Couldn't upload the video: ${message}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (value) {
    return (
      <div>
        <Label>Video walkthrough</Label>
        <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-border p-3">
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {value}
          </a>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove video"
            className="grid size-7 shrink-0 place-items-center rounded-full bg-muted hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label>Video walkthrough (optional)</Label>
      <div className="mt-1">
        {uploading ? (
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Loader2 className="size-4 animate-spin" /> Uploading… {Math.round(progress * 100)}%
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-accent transition-[width]"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="press inline-flex items-center gap-2 rounded-md border-2 border-dashed border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-accent hover:text-foreground"
            >
              <Film className="size-4" /> Upload a video
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput((v) => !v)}
              className="press inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <Link2 className="size-4" /> Or paste a YouTube link
            </button>
          </div>
        )}
      </div>

      {showLinkInput && !uploading && (
        <Input
          className="mt-2"
          type="url"
          placeholder="https://youtu.be/…"
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <p className="mt-2 text-xs text-muted-foreground">
        Up to 500MB (MP4, MOV, WEBM, AVI). Uploaded as unlisted — only people with the link can see
        it.
      </p>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

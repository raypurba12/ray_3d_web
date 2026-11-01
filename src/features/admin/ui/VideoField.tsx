import { useEffect, useRef, useState } from "react";
import { Film, Loader2, Upload, X } from "lucide-react";

import { resolveAssetUrl, uploadVideoFile } from "../../../lib/api";
import { parseVideoSource } from "../../../lib/video";
import { describeError } from "./serverErrors";
import {
  buttonGhost,
  fieldErrorClass,
  inputClass,
  labelClass,
} from "./styles";

const ACCEPTED_TYPES = ["video/mp4", "video/webm"];
const MAX_SIZE = 25 * 1024 * 1024;
const ACCEPTED_LABEL = "MP4 atau WebM (maks. 25MB)";

type VideoMode = "upload" | "url";

type VideoFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const VideoField = ({ value, error, onChange, disabled }: VideoFieldProps) => {
  const [mode, setMode] = useState<VideoMode>("upload");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadError(null);
  }, [value]);

  const source = parseVideoSource(value);
  const previewUrl = source?.kind === "file" ? resolveAssetUrl(source.url) : "";

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setUploadError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError(`Tipe file tidak didukung. Gunakan ${ACCEPTED_LABEL}.`);
      return;
    }

    if (file.size > MAX_SIZE) {
      setUploadError("Ukuran video maksimal 25MB.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const asset = await uploadVideoFile(file, setProgress);
      onChange(asset.path);
      setProgress(100);
    } catch (err) {
      setUploadError(describeError(err, "Upload video gagal."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className={labelClass}>Demo video (optional)</span>

      <div className="flex gap-2">
        {(["upload", "url"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              mode === item
                ? "bg-acid text-black"
                : "border border-white/10 bg-white/[0.04] font-medium text-secondary hover:text-white"
            }`}
          >
            {item === "upload" ? "Upload" : "YouTube / URL"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <button
            type="button"
            className={`${buttonGhost} w-full`}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || disabled}
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? `Mengunggah... ${progress}%` : "Pilih file video"}
          </button>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
            {ACCEPTED_LABEL}
          </p>
          {uploading && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-acid transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {uploadError && <p className={fieldErrorClass}>{uploadError}</p>}
        </div>
      ) : (
        <div className="mt-3">
          <input
            type="url"
            className={inputClass}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://youtube.com/watch?v=... atau https://.../demo.mp4"
            disabled={disabled}
          />
        </div>
      )}

      {value ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate font-mono text-[10px] text-white/40">
              {source?.kind === "youtube"
                ? `YouTube • ${source.id}`
                : source?.kind === "vimeo"
                  ? `Vimeo • ${source.id}`
                  : source?.kind === "file"
                    ? "File video"
                    : "URL tidak dikenali"}
            </span>
            <button
              type="button"
              aria-label="Hapus video demo"
              className="text-white/40 transition hover:text-red-300"
              onClick={() => onChange("")}
              disabled={disabled}
            >
              <X size={14} />
            </button>
          </div>

          {source?.kind === "file" ? (
            <video
              key={previewUrl}
              src={previewUrl}
              controls
              preload="metadata"
              playsInline
              className="mt-3 aspect-video w-full rounded-lg bg-black object-contain"
            />
          ) : source ? (
            <div className="mt-3 flex aspect-video w-full items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.06] to-transparent">
              <Film size={28} className="text-white/30" />
            </div>
          ) : (
            <p className="mt-3 text-xs text-amber-300/80">
              Gunakan link YouTube, Vimeo, atau file .mp4/.webm.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-white/30">
          Tanpa video, tombol demo tidak tampil di halaman Works.
        </p>
      )}

      {error && <p className={fieldErrorClass}>{error}</p>}
    </div>
  );
};

export default VideoField;

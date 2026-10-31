import { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";

import { resolveAssetUrl, uploadFile } from "../../../lib/api";
import { describeError } from "./serverErrors";
import {
  buttonGhost,
  fieldErrorClass,
  inputClass,
  labelClass,
} from "./styles";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_LABEL = "JPEG, PNG, WebP, atau GIF (maks. 5MB)";

type ImageMode = "upload" | "url";

type ImageFieldProps = {
  value: string;
  error?: string;
  label?: string;
  aspectClass?: string;
  required?: boolean;
  onChange: (value: string) => void;
};

const ImageField = ({
  value,
  error,
  label = "Image",
  aspectClass = "aspect-[16/9]",
  required = false,
  onChange,
}: ImageFieldProps) => {
  const [mode, setMode] = useState<ImageMode>("upload");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewBroken, setPreviewBroken] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewBroken(false);
  }, [value]);

  const preview = resolveAssetUrl(value);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setUploadError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError(`Tipe file tidak didukung. Gunakan ${ACCEPTED_LABEL}.`);
      return;
    }

    if (file.size > MAX_SIZE) {
      setUploadError("Ukuran file maksimal 5MB.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const asset = await uploadFile(file, setProgress);
      onChange(asset.path);
      setProgress(100);
    } catch (err) {
      setUploadError(describeError(err, "Upload gagal."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            mode === "upload"
              ? "bg-acid text-black"
              : "border border-white/10 bg-white/[0.04] font-medium text-secondary hover:text-white"
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            mode === "url"
              ? "bg-acid text-black"
              : "border border-white/10 bg-white/[0.04] font-medium text-secondary hover:text-white"
          }`}
        >
          URL
        </button>
      </div>

      {mode === "upload" ? (
        <div key="upload" className="mt-3">
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
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? `Mengunggah... ${progress}%` : "Pilih file gambar"}
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
        <div key="url" className="mt-3">
          <input
            type="text"
            className={inputClass}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      )}

      <div
        className={`relative mt-4 w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent ${aspectClass}`}
      >
        {preview && !previewBroken ? (
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={() => setPreviewBroken(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
            No image
          </div>
        )}
      </div>

      {value && (
        <p className="mt-2 truncate font-mono text-[10px] text-white/30">
          {value}
        </p>
      )}

      {error && <p className={fieldErrorClass}>{error}</p>}
    </div>
  );
};

export default ImageField;

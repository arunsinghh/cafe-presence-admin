import React, { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { resolveImageUrl } from "../lib/format";

interface ImageUploadFieldProps {
  label?: string;
  value?: string | null;
  file?: File | null;
  onChangeFile: (file: File | null) => void;
  onRemoveExisting?: () => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function ImageUploadField({
  label = "Voucher Photo",
  value,
  file,
  onChangeFile,
  onRemoveExisting,
  disabled = false
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");

  // Manage object URL for newly selected local file
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const activeDisplayUrl = previewUrl || (value ? resolveImageUrl(value) : null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError("");
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setLocalError("Invalid format. Only JPEG, PNG, and WebP are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (selectedFile.size > MAX_SIZE_BYTES) {
      setLocalError("Image file size exceeds the 5 MB limit.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    onChangeFile(selectedFile);
  };

  const handleClear = () => {
    setLocalError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (file) {
      onChangeFile(null);
    } else if (value && onRemoveExisting) {
      onRemoveExisting();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </label>
        <span className="text-[10px] text-text-secondary font-mono">
          JPEG, PNG, WebP (max 5MB)
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {activeDisplayUrl ? (
        <div className="flex items-center gap-4 rounded-input border border-border bg-background p-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-input border border-border bg-surface">
            <img
              src={activeDisplayUrl}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "";
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-text-primary">
              {file ? file.name : "Current Photo"}
            </p>
            <p className="text-[10px] text-text-secondary font-mono">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "Uploaded on server"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="ghost-button py-1 px-2.5 text-xs"
            >
              Replace
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={handleClear}
              className="danger-button py-1 px-2 text-xs"
              title="Remove photo"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            if (!disabled) fileInputRef.current?.click();
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-input border border-dashed border-border bg-background py-5 px-4 text-center transition hover:border-accent-gold/50 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-accent-gold mb-2">
            <Upload size={18} />
          </div>
          <p className="text-xs font-medium text-text-primary">
            Click to upload photo
          </p>
          <p className="mt-0.5 text-[10px] text-text-secondary">
            Recommended size 600x400 (under 5MB)
          </p>
        </div>
      )}

      {localError && (
        <p className="text-xs text-accent-red mt-1">{localError}</p>
      )}
    </div>
  );
}


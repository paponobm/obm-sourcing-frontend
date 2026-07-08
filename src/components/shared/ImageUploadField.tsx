"use client";

import { useEffect, useMemo, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageValue } from "@/lib/image-value";

/**
 * Picks and locally previews an image without uploading it — the actual
 * Cloudinary upload happens once, at form-submit time (see resolveImageValue),
 * so a picked-then-abandoned form never creates an orphaned Cloudinary asset.
 */
export function ImageUploadField({
  value,
  onChange,
  className,
  size = "md",
}: {
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dimension = size === "sm" ? "h-16 w-16" : "h-24 w-24";

  const previewUrl = useMemo(() => {
    if (value instanceof File) return URL.createObjectURL(value);
    return value;
  }, [value]);

  useEffect(() => {
    return () => {
      if (value instanceof File && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [value, previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onChange(file);
  };

  return (
    <div className={cn("relative", dimension, className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          dimension,
          "flex items-center justify-center overflow-hidden rounded-md border border-dashed border-line bg-paper-2 text-gray hover:border-teal",
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-5 w-5" />
        )}
      </button>

      {previewUrl && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label="ছবি সরান"
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red text-white"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

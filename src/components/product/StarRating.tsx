"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SCALE = [1, 2, 3, 4, 5] as const;

/** Read-only by default; pass onChange to make it an interactive picker. */
export function StarRating({
  value,
  onChange,
  size = 14,
  className,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
}) {
  const interactive = Boolean(onChange);

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {SCALE.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(!interactive && "cursor-default")}
          aria-label={`${star} স্টার`}
        >
          <Star
            size={size}
            className={star <= value ? "fill-brass text-brass" : "fill-transparent text-line"}
          />
        </button>
      ))}
    </span>
  );
}

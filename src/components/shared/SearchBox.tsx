"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBox({
  value,
  onChange,
  placeholder = "প্রোডাক্ট বা ভেন্ডর সার্চ করুন...",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex w-[280px] items-center gap-2 rounded-[5px] border border-line bg-white px-3 py-2 text-[13px] text-gray",
        "focus-within:ring-2 focus-within:ring-ring/30",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 opacity-70" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-ink placeholder:text-gray focus:outline-none"
      />
    </label>
  );
}

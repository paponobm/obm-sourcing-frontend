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
        "flex h-9 w-full items-center gap-1.5 rounded border border-line bg-white px-2.5 text-xs text-gray sm:h-10 sm:w-56 sm:gap-2 sm:px-3 sm:text-sm lg:h-11 lg:w-72 lg:px-3.5 lg:text-base",
        "focus-within:ring-2 focus-within:ring-ring/30",
        className,
      )}
    >
      <Search className="h-3.5 w-3.5 shrink-0 opacity-70 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-ink placeholder:text-gray focus:outline-none"
      />
    </label>
  );
}

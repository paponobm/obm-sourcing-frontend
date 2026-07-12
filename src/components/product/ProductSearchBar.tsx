"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Unlike SearchBox elsewhere (instant, debounced), this commits on Enter or
 * the Search button only — a deliberate deviation asked for on this page. */
export function ProductSearchBar({ onSearch }: { onSearch: (value: string) => void }) {
  const [value, setValue] = useState("");

  const submit = () => onSearch(value);

  return (
    <div className="flex h-9 items-stretch gap-1.5 sm:h-10">
      <label className="flex h-full w-full items-center gap-1.5 rounded border border-line bg-white px-2.5 text-xs text-gray focus-within:ring-2 focus-within:ring-ring/30 sm:w-56 sm:gap-2 sm:px-3 sm:text-sm lg:w-72 lg:px-3.5 lg:text-base">
        <Search className="h-3.5 w-3.5 shrink-0 opacity-70 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="প্রোডাক্ট বা SKU সার্চ করুন..."
          className="w-full bg-transparent text-ink placeholder:text-gray focus:outline-none"
        />
      </label>
      <Button type="button" variant="ghost" onClick={submit}>
        সার্চ
      </Button>
    </div>
  );
}

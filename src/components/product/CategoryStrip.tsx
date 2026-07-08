"use client";

import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category.types";

export function CategoryStrip({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:gap-3 lg:mb-5 lg:gap-4">
      <CategoryTile
        label="সব"
        selected={selectedId === ""}
        onClick={() => onSelect("")}
        icon={<LayoutGrid className="h-4 w-4 text-white sm:h-5 sm:w-5 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />}
      />
      {categories.map((c) => (
        <CategoryTile
          key={c.id}
          label={c.name}
          imageUrl={c.imageUrl}
          selected={selectedId === c.id}
          onClick={() => onSelect(c.id)}
        />
      ))}
    </div>
  );
}

function CategoryTile({
  label,
  imageUrl,
  icon,
  selected,
  onClick,
}: {
  label: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 flex-col items-center gap-1 sm:gap-1.5"
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-teal ring-2 ring-offset-2 ring-offset-paper transition sm:h-14 sm:w-14 lg:h-[72px] lg:w-[72px] xl:h-20 xl:w-20",
          selected ? "ring-brass" : "ring-transparent",
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          icon ?? (
            <span className="font-serif text-sm text-white sm:text-base lg:text-xl xl:text-2xl">
              {label.slice(0, 1)}
            </span>
          )
        )}
      </span>
      <span
        className={cn(
          "max-w-[52px] truncate text-xs sm:max-w-[64px] sm:text-sm lg:max-w-[80px] lg:text-base xl:max-w-[88px] xl:text-lg",
          selected ? "font-semibold text-teal-dark" : "text-gray",
        )}
      >
        {label}
      </span>
    </button>
  );
}

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
    <div className="mb-5 flex gap-3 overflow-x-auto pb-1">
      <CategoryTile
        label="সব"
        selected={selectedId === ""}
        onClick={() => onSelect("")}
        icon={<LayoutGrid className="h-6 w-6 text-white" />}
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
      className="flex shrink-0 flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          "flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-teal ring-2 ring-offset-2 ring-offset-paper transition",
          selected ? "ring-brass" : "ring-transparent",
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          icon ?? <span className="font-serif text-lg text-white">{label.slice(0, 1)}</span>
        )}
      </span>
      <span className={cn("max-w-[68px] truncate text-xs", selected ? "font-semibold text-teal-dark" : "text-gray")}>
        {label}
      </span>
    </button>
  );
}

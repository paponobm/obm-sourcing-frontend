"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { matchesProductSearch } from "@/utils/bangla-search";

export type SearchableProductOption = {
  id: string;
  name: string;
};

/**
 * A searchable product combobox — types into a text input, filters the list
 * in real time (Bangla substring or English-phonetic transliteration, see
 * `@/utils/bangla-search`), and only ever calls `onChange` with a real
 * product's id, never free text. That makes `value` truthy a reliable
 * "a valid product is selected" signal for callers (e.g. disabling a submit
 * button) without any extra validity plumbing.
 *
 * Filters `products` locally today. To wire up server-side search later,
 * pass `onSearchChange` (already debounced ~300ms) and use it to refetch
 * `products` with a `search` query param — nothing else about the component
 * needs to change.
 */
export function SearchableProductSelect({
  id,
  products,
  value,
  onChange,
  placeholder = "প্রোডাক্টের নাম লিখুন (বাংলা বা ইংরেজিতে)...",
  isLoading = false,
  invalid = false,
  disabled = false,
  onSearchChange,
  emptyMessage = "কোনো মিলিত প্রোডাক্ট পাওয়া যায়নি।",
}: {
  id?: string;
  products: SearchableProductOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  onSearchChange?: (query: string) => void;
  emptyMessage?: string;
}) {
  const selectedProduct = products.find((p) => p.id === value);
  const [query, setQuery] = useState(selectedProduct?.name ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the displayed text synced when the selected value changes from
  // outside this component (e.g. form reset) — but not while the user is
  // actively typing/browsing, so we don't stomp on their in-progress search.
  useEffect(() => {
    if (!open) {
      setQuery(selectedProduct?.name ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const debouncedQuery = useDebounce(query, 300);
  useEffect(() => {
    onSearchChange?.(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const filtered = useMemo(
    () => products.filter((p) => matchesProductSearch(p.name, query)),
    [products, query],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectProduct = (product: SearchableProductOption) => {
    onChange(product.id);
    setQuery(product.name);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const active = filtered[activeIndex];
      if (active) selectProduct(active);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // A non-empty query that doesn't resolve to the currently-selected product
  // means the user typed something that doesn't (yet, or at all) match a
  // real product — `value` stays empty until they pick one from the list.
  const hasUnresolvedText = query.trim() !== "" && selectedProduct?.name !== query;
  const listboxId = `${id ?? "searchable-product"}-listbox`;

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-invalid={invalid || hasUnresolvedText}
        autoComplete="off"
        disabled={disabled}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (value) onChange("");
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded border bg-white px-2.5 font-sans text-xs text-ink placeholder:text-gray/70 sm:h-10 sm:px-3 sm:text-sm lg:h-11 lg:px-3.5 lg:text-base",
          "focus:outline-none focus:ring-2 focus:ring-ring/40",
          invalid || hasUnresolvedText ? "border-red" : "border-line",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />

      {open && !disabled && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line bg-white p-1 shadow-panel"
        >
          {isLoading ? (
            <li className="px-3 py-2 text-xs text-gray sm:text-sm">লোড হচ্ছে...</li>
          ) : filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-gray sm:text-sm">{emptyMessage}</li>
          ) : (
            filtered.map((p, index) => (
              <li key={p.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={p.id === value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectProduct(p)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-left text-xs outline-none sm:text-sm lg:text-base",
                    index === activeIndex ? "bg-paper-2" : "hover:bg-paper-2",
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {p.id === value && <Check className="h-4 w-4 text-teal" />}
                  </span>
                  {p.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {hasUnresolvedText && (
        <p className="mt-1 text-[11px] text-red sm:text-xs">
          এই প্রোডাক্টটি নেই। অনুগ্রহ করে একটি সঠিক প্রোডাক্ট নির্বাচন করুন।
        </p>
      )}
    </div>
  );
}

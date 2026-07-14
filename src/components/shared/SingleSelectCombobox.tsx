"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type SingleSelectOption = {
  id: string;
  label: string;
};

/**
 * A searchable single-select combobox — types into a text input, filters the
 * list in real time (plain case-insensitive substring match), and selects a
 * single value, closing on pick — the single-select counterpart to
 * `MultiSelectCombobox` (which stays open and accumulates a list). Modeled on
 * `SearchableProductSelect`'s interaction pattern (input-as-trigger, arrow
 * keys + Enter, click-outside-to-close) but generic over any `{id, label}`
 * option list instead of being product-search-specific.
 */
export function SingleSelectCombobox({
  id,
  options,
  value,
  onChange,
  placeholder = "নির্বাচন করুন...",
  isLoading = false,
  invalid = false,
  disabled = false,
  emptyMessage = "কোনো মিলিত ফলাফল পাওয়া যায়নি।",
}: {
  id?: string;
  options: SingleSelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
}) {
  const selected = options.find((o) => o.id === value);
  const [query, setQuery] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the displayed text synced when the selected value changes from
  // outside this component (e.g. form reset), or when `options` arrives/
  // updates after `value` was already set (e.g. a quick-create modal creates
  // a new option and selects it before that option's own list has refetched)
  // — but not while the user is actively typing/browsing, so we don't stomp
  // on their in-progress search.
  useEffect(() => {
    if (!open) {
      setQuery(selected?.label ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((o) => o.label.toLowerCase().includes(term));
  }, [options, query]);

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

  const selectOption = (option: SingleSelectOption) => {
    onChange(option.id);
    setQuery(option.label);
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
      if (active) selectOption(active);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const listboxId = `${id ?? "single-select"}-listbox`;

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
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
        placeholder={isLoading ? "লোড হচ্ছে..." : placeholder}
        className={cn(
          "h-9 w-full rounded border bg-white px-2.5 font-sans text-xs text-ink placeholder:text-gray/70 sm:h-10 sm:px-3 sm:text-sm lg:h-11 lg:px-3.5 lg:text-base",
          "focus:outline-none focus:ring-2 focus:ring-ring/40",
          invalid ? "border-red" : "border-line",
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
            filtered.map((option, index) => (
              <li key={option.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={option.id === value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-left text-xs outline-none sm:text-sm lg:text-base",
                    index === activeIndex ? "bg-paper-2" : "hover:bg-paper-2",
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {option.id === value && <Check className="h-4 w-4 text-teal" />}
                  </span>
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

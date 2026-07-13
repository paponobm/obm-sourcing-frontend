"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  id: string;
  label: string;
};

/**
 * A searchable multi-select combobox — selected options render as removable
 * chips inside the trigger, typing filters the dropdown in real time, and
 * clicking a row toggles it in/out of `value` without closing the dropdown
 * (so several picks can be made in one open session). Adapted from
 * `SearchableProductSelect`'s combobox plumbing (click-outside, listbox
 * markup/styling), but that component selects-and-closes for a single value
 * — this one stays open and accumulates a list.
 */
export function MultiSelectCombobox({
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
  options: MultiSelectOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => value.map((id) => options.find((o) => o.id === id)).filter((o): o is MultiSelectOption => Boolean(o)),
    [value, options],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((o) => o.label.toLowerCase().includes(term));
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionId: string) => {
    if (value.includes(optionId)) {
      onChange(value.filter((v) => v !== optionId));
    } else {
      onChange([...value, optionId]);
    }
  };

  const removeChip = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionId));
  };

  const listboxId = `${id ?? "multi-select"}-listbox`;

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
        className={cn(
          "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded border bg-white px-2 py-1.5 sm:min-h-10 lg:min-h-11",
          "cursor-text focus-within:ring-2 focus-within:ring-ring/40",
          invalid ? "border-red" : "border-line",
          disabled ? "cursor-not-allowed opacity-50" : "",
        )}
      >
        {selected.map((option) => (
          <span
            key={option.id}
            className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2 py-0.5 text-[11px] text-ink sm:text-xs"
          >
            {option.label}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => removeChip(option.id, e)}
              className="cursor-pointer text-gray hover:text-red"
              aria-label={`${option.label} বাদ দিন`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
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
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder={selected.length === 0 ? (isLoading ? "লোড হচ্ছে..." : placeholder) : ""}
          className="min-w-[80px] flex-1 border-none bg-transparent font-sans text-xs text-ink placeholder:text-gray/70 focus:outline-none sm:text-sm lg:text-base"
        />
      </div>

      {open && !disabled && (
        <ul
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line bg-white p-1 shadow-panel"
        >
          {isLoading ? (
            <li className="px-3 py-2 text-xs text-gray sm:text-sm">লোড হচ্ছে...</li>
          ) : filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-gray sm:text-sm">{emptyMessage}</li>
          ) : (
            filtered.map((option) => {
              const isSelected = value.includes(option.id);
              return (
                <li key={option.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggleOption(option.id)}
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-left text-xs outline-none hover:bg-paper-2 sm:text-sm lg:text-base"
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      {isSelected && <Check className="h-4 w-4 text-teal" />}
                    </span>
                    {option.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

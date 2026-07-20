"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  detectQuickDateRangeOption,
  getQuickDateRange,
  type QuickDateRangeOption,
} from "@/utils/quick-date-range";

const OPTIONS: { value: QuickDateRangeOption; label: string }[] = [
  { value: "today", label: "আজ" },
  { value: "thisWeek", label: "এই সপ্তাহ" },
  { value: "thisMonth", label: "এই মাস" },
  { value: "custom", label: "কাস্টম" },
];

/** Sits beside an existing Start/End date input pair. Its displayed value is
 * always derived from the current dateFrom/dateTo (never separate state) —
 * so manually editing either date input naturally shows "কাস্টম" here with no
 * extra wiring, and picking a quick option here writes the matching computed
 * range straight back through the same onChange callbacks the date inputs
 * already use. */
export function QuickDateRangeSelect({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  className,
}: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  className?: string;
}) {
  const selected = detectQuickDateRangeOption(dateFrom, dateTo);

  const handleChange = (value: QuickDateRangeOption) => {
    if (value === "custom") return; // just switch the display; the user edits the dates manually
    const range = getQuickDateRange(value);
    onDateFromChange(range.dateFrom);
    onDateToChange(range.dateTo);
  };

  return (
    <Select value={selected} onValueChange={(v) => handleChange(v as QuickDateRangeOption)}>
      <SelectTrigger className={className ?? "w-32"} aria-label="কুইক ডেট রেঞ্জ">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export type QuickDateRangeOption = "today" | "thisWeek" | "thisMonth" | "custom";

function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(d: Date): Date {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const result = new Date(start);
  result.setDate(start.getDate() + 6);
  return result;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/** Computes the {dateFrom, dateTo} pair (plain "YYYY-MM-DD" strings, same
 * format the native <input type="date"> already uses everywhere) for a
 * quick-range option, anchored to `now` (real current time by default). */
export function getQuickDateRange(
  option: Exclude<QuickDateRangeOption, "custom">,
  now: Date = new Date(),
): { dateFrom: string; dateTo: string } {
  switch (option) {
    case "today": {
      const today = toDateString(now);
      return { dateFrom: today, dateTo: today };
    }
    case "thisWeek":
      return { dateFrom: toDateString(startOfWeek(now)), dateTo: toDateString(endOfWeek(now)) };
    case "thisMonth":
      return { dateFrom: toDateString(startOfMonth(now)), dateTo: toDateString(endOfMonth(now)) };
  }
}

/** Reverse-maps a {dateFrom, dateTo} pair back onto whichever quick option it
 * matches, or "custom" if it matches none — this is what keeps a quick-range
 * dropdown and its paired raw date inputs in sync with no extra state: the
 * dropdown's displayed value is always just derived from the current
 * dateFrom/dateTo, so manually editing either date naturally falls through
 * to "custom" on its own. */
export function detectQuickDateRangeOption(
  dateFrom: string,
  dateTo: string,
  now: Date = new Date(),
): QuickDateRangeOption {
  const options: Exclude<QuickDateRangeOption, "custom">[] = ["today", "thisWeek", "thisMonth"];
  for (const option of options) {
    const range = getQuickDateRange(option, now);
    if (dateFrom === range.dateFrom && dateTo === range.dateTo) return option;
  }
  return "custom";
}

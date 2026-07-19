import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * The Dashboard's date-range scope — same `type="date"` input pair already
 * used by the Order Management page's advanced filters (`OrderAdvancedFilters.tsx`),
 * reused here for visual/behavioral consistency rather than a new picker.
 * Both bounds are plain "YYYY-MM-DD" strings (native `<input type="date">`
 * output), passed straight through as `dateFrom`/`dateTo` query params.
 */
export function DateRangeFilter({
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: {
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}) {
  const hasFilter = Boolean(dateFrom || dateTo);

  return (
    <div className="mb-3.5 flex flex-wrap items-end gap-2.5 sm:mb-4">
      <div>
        <Label htmlFor="dashboard-date-from">শুরুর তারিখ</Label>
        <Input
          id="dashboard-date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="sm:w-44"
        />
      </div>
      <div>
        <Label htmlFor="dashboard-date-to">শেষ তারিখ</Label>
        <Input
          id="dashboard-date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="sm:w-44"
        />
      </div>
      {hasFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onDateFromChange("");
            onDateToChange("");
          }}
        >
          <X className="h-3.5 w-3.5" /> ফিল্টার মুছুন
        </Button>
      )}
    </div>
  );
}

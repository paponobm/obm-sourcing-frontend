import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toBnDigits } from "@/utils/date";

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-line px-3 py-2.5 text-[0.6875rem] text-gray sm:px-4 sm:py-3 sm:text-xs lg:px-[18px] lg:text-sm">
      <span className="font-mono">
        {total === 0 ? "কোনো ফলাফল নেই" : `${toBnDigits(from)}–${toBnDigits(to)} দেখানো হচ্ছে, মোট ${toBnDigits(total)}`}
      </span>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
        </Button>
        <span className="font-mono">
          {toBnDigits(page)} / {toBnDigits(totalPages)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
        </Button>
      </div>
    </div>
  );
}

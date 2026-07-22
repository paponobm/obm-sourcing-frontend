"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useProductActivityLogs } from "@/hooks/useProducts";
import { PRODUCT_ACTIVITY_ACTION_LABEL_BN } from "@/utils/status";
import { formatBnDate, formatBnTime } from "@/utils/date";
import { PriceChangeActivityDetails } from "@/components/shared/PriceChangeActivityDetails";

export function ProductActivityLogModal({
  productId,
  productName,
  onOpenChange,
}: {
  productId: string | null;
  productName: string;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: logs, isLoading } = useProductActivityLogs(productId ?? undefined);

  return (
    <Dialog open={Boolean(productId)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>অ্যাক্টিভিটি লগ</DialogTitle>
          <DialogDescription>&quot;{productName}&quot; এর সকল পরিবর্তনের ইতিহাস।</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {isLoading && <p className="text-sm text-gray">লোড হচ্ছে...</p>}

          {!isLoading && (logs?.length ?? 0) === 0 && (
            <p className="py-6 text-center text-sm text-gray">এখনো কোনো অ্যাক্টিভিটি নেই।</p>
          )}

          {logs?.map((log) => (
            <div key={log.id} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{PRODUCT_ACTIVITY_ACTION_LABEL_BN[log.actionType]}</span>
                <span className="whitespace-nowrap font-mono text-[11px] text-brass sm:text-xs ">
                  {formatBnDate(log.createdAt)} {formatBnTime(log.createdAt)}
                </span>
              </div>

              {log.actionType === "PRICE_CHANGED" ? (
                <PriceChangeActivityDetails log={log} productName={productName} />
              ) : (
                <p className="mt-1 text-[11px] text-gray sm:text-xs">{log.description}</p>
              )}

              <p className="mt-1.5 text-[11px] text-gray sm:text-xs">
                পরিবর্তনকারী: {log.performedByName}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

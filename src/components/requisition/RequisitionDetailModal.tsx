"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PriceChangeActivityDetails } from "@/components/shared/PriceChangeActivityDetails";
import { SuggestedVendorBadge } from "@/components/requisition/SuggestedVendorBadge";
import { useRequisition, useRequisitionActivityLogs } from "@/hooks/useRequisitions";
import { PRODUCT_ACTIVITY_ACTION_LABEL_BN } from "@/utils/status";
import { formatBnDate, formatBnTime, toBnDigits } from "@/utils/date";

/** "বিস্তারিত দেখুন" — a requisition's full item list plus its complete
 * activity-log history, reusing ProductActivityLogModal's exact visual
 * pattern (Dialog + scrollable log list). */
export function RequisitionDetailModal({
  requisitionId,
  onOpenChange,
}: {
  requisitionId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: requisition } = useRequisition(requisitionId ?? undefined);
  const { data: logs, isLoading } = useRequisitionActivityLogs(requisitionId ?? undefined);

  return (
    <Dialog open={Boolean(requisitionId)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{requisition?.requisitionCode ?? "রিকুইজিশন"}</DialogTitle>
          <DialogDescription>প্রোডাক্ট তালিকা ও সম্পূর্ণ কার্যক্রমের ইতিহাস।</DialogDescription>
        </DialogHeader>

        {requisition && (
          <div className="space-y-1.5 rounded-md border border-line p-2.5 sm:p-3">
            {requisition.items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] sm:text-xs">
                <span className="flex flex-wrap items-center gap-1.5 text-ink">
                  {item.productName} — <span className="font-mono">{toBnDigits(item.requiredQty)}</span> {item.unit}
                  {item.notes ? ` (${item.notes})` : ""}
                  {/* <SuggestedVendorBadge vendor={item.suggestedVendor} /> */}
                </span>
                <Badge variant={item.fulfilled ? "active" : "low"}>
                  {item.fulfilled ? "অর্ডার করা হয়েছে" : "বাকি আছে"}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="max-h-[50vh] space-y-3 overflow-y-auto">
          {isLoading && <p className="text-sm text-gray">লোড হচ্ছে...</p>}

          {!isLoading && (logs?.length ?? 0) === 0 && (
            <p className="py-6 text-center text-sm text-gray">এখনো কোনো অ্যাক্টিভিটি নেই।</p>
          )}

          {logs?.map((log) => (
            <div key={log.id} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{PRODUCT_ACTIVITY_ACTION_LABEL_BN[log.actionType]}</span>
                <span className="whitespace-nowrap font-mono text-[11px] text-gray sm:text-xs">
                  {formatBnDate(log.createdAt)} {formatBnTime(log.createdAt)}
                </span>
              </div>

              {log.actionType === "PRICE_CHANGED" ? (
                <PriceChangeActivityDetails log={log} productName={log.productName ?? ""} />
              ) : (
                <p className="mt-1 text-[11px] text-gray sm:text-xs">
                  {log.productName ? `${log.productName} — ` : ""}
                  {log.description}
                </p>
              )}

              <p className="mt-1.5 text-[11px] text-gray sm:text-xs">পরিবর্তনকারী: {log.performedByName}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

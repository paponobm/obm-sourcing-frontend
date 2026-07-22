"use client";

import { Card, CardHeader, CardTitle, CardTag } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { PriceChangeActivityDetails } from "@/components/shared/PriceChangeActivityDetails";
import { useVendorActivityLogs } from "@/hooks/useVendors";
import { PRODUCT_ACTIVITY_ACTION_LABEL_BN } from "@/utils/status";
import { formatBnDate, formatBnTime, toBnDigits } from "@/utils/date";

/** "প্রোফাইল → অ্যাক্টিভিটি লগ" — every price/rating/status/vendor-added
 * change for this vendor, across every product it supplies. Same underlying
 * ProductActivityLog rows as the per-product activity modal, just filtered
 * by vendorId instead of productId, so each entry also names its product. */
export function VendorActivityLogSection({ vendorId }: { vendorId: string }) {
  const { data: logs, isLoading } = useVendorActivityLogs(vendorId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>অ্যাক্টিভিটি লগ</CardTitle>
        <CardTag className="font-mono">{toBnDigits(logs?.length ?? 0)} টি</CardTag>
      </CardHeader>

      <div className="space-y-3 p-3 sm:p-4">
        {isLoading && <p className="text-sm text-gray">লোড হচ্ছে...</p>}

        {!isLoading && (logs?.length ?? 0) === 0 && (
          <EmptyState title="এখনো কোনো অ্যাক্টিভিটি নেই" description="এই ভেন্ডরের জন্য এখনো কোনো পরিবর্তনের ইতিহাস নেই।" />
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
    </Card>
  );
}

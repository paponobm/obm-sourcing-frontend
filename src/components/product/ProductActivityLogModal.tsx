"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useProductActivityLogs } from "@/hooks/useProducts";
import { PRODUCT_ACTIVITY_ACTION_LABEL_BN } from "@/utils/status";
import { formatBnDate, formatBnTime } from "@/utils/date";
import type { ProductActivityLog } from "@/types/product.types";

function PriceChangeDetails({ log, productName }: { log: ProductActivityLog; productName: string }) {
  const oldPrice = log.oldValue?.price as number | undefined;
  const newPrice = log.newValue?.price as number | undefined;
  const difference = log.newValue?.difference as number | undefined;
  const vendorName = (log.description.match(/ভেন্ডর:\s*([^,]+),/) ?? [])[1]?.trim();

  return (
    <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray sm:text-xs">
      <div>
        <dt className="inline text-gray">প্রোডাক্ট: </dt>
        <dd className="inline text-ink">{productName}</dd>
      </div>
      {vendorName && (
        <div>
          <dt className="inline text-gray">ভেন্ডর: </dt>
          <dd className="inline text-ink">{vendorName}</dd>
        </div>
      )}
      <div>
        <dt className="inline text-gray">পুরাতন দাম: </dt>
        <dd className="inline text-ink">৳{oldPrice}</dd>
      </div>
      <div>
        <dt className="inline text-gray">নতুন দাম: </dt>
        <dd className="inline text-ink">৳{newPrice}</dd>
      </div>
      {difference !== undefined && (
        <div>
          <dt className="inline text-gray">পার্থক্য: </dt>
          <dd className={`inline font-medium ${difference > 0 ? "text-red" : "text-teal"}`}>
            {difference > 0 ? "+" : ""}
            {difference}
          </dd>
        </div>
      )}
    </dl>
  );
}

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
                <span className="whitespace-nowrap text-[11px] text-gray sm:text-xs">
                  {formatBnDate(log.createdAt)} {formatBnTime(log.createdAt)}
                </span>
              </div>

              {log.actionType === "PRICE_CHANGED" ? (
                <PriceChangeDetails log={log} productName={productName} />
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

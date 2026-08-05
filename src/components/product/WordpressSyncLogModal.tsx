"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useWordpressSyncLogs } from "@/hooks/useWordpress";
import { formatBnDate, formatBnTime, toBnDigits } from "@/utils/date";

export function WordpressSyncLogModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: logs, isLoading } = useWordpressSyncLogs({ enabled: open });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>WordPress সিঙ্ক অ্যাক্টিভিটি লগ</DialogTitle>
          <DialogDescription>সাম্প্রতিক সিঙ্ক রানগুলোর ফলাফল ও স্কিপ হওয়ার কারণ।</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {isLoading && <p className="text-sm text-gray">লোড হচ্ছে...</p>}

          {!isLoading && (logs?.length ?? 0) === 0 && (
            <p className="py-6 text-center text-sm text-gray">এখনো কোনো সিঙ্ক করা হয়নি।</p>
          )}

          {logs?.map((log) => (
            <div key={log.id} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">
                  ইম্পোর্ট: {toBnDigits(log.imported)} | আপডেট: {toBnDigits(log.updated)} | স্কিপড:{" "}
                  {toBnDigits(log.skippedUnchanged)}
                </span>
                <span className="whitespace-nowrap font-mono text-[11px] text-brass sm:text-xs">
                  {formatBnDate(log.finishedAt)} {formatBnTime(log.finishedAt)}
                </span>
              </div>

              <div className="mt-1.5 space-y-0.5 text-[11px] text-gray sm:text-xs">
                <p>স্কিপ হওয়ার কারণ — ইতিমধ্যে সিঙ্ক করা (অপরিবর্তিত): {toBnDigits(log.skippedUnchanged)}</p>
                {(log.missingSku > 0 || log.missingUnit > 0 || log.missingCategory > 0) && (
                  <p>
                    ইম্পোর্ট হওয়া প্রোডাক্টের তথ্য অসম্পূর্ণ (অনুমোদনের আগে যোগ করতে হবে) — SKU নেই:{" "}
                    {toBnDigits(log.missingSku)}, ইউনিট নেই: {toBnDigits(log.missingUnit)}, ক্যাটাগরি নেই:{" "}
                    {toBnDigits(log.missingCategory)}
                  </p>
                )}
              </div>

              <p className="mt-1.5 text-[11px] text-gray sm:text-xs">সিঙ্ক করেছেন: {log.triggeredByName ?? "—"}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

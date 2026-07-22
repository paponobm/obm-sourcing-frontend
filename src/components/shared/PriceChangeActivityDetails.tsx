import { formatBDT } from "@/utils/currency";

/** Rich field layout for a PRICE_CHANGED activity log entry — shared by the
 * per-product activity modal and the per-vendor activity log section, since
 * both render the exact same underlying log rows, just scoped differently. */
export function PriceChangeActivityDetails({
  log,
  productName,
}: {
  log: { oldValue: Record<string, unknown> | null; newValue: Record<string, unknown> | null; description: string };
  productName: string;
}) {
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
        <dd className="inline font-mono text-brass">{oldPrice !== undefined ? formatBDT(oldPrice) : "—"}</dd>
      </div>
      <div>
        <dt className="inline text-gray">নতুন দাম: </dt>
        <dd className="inline font-mono text-brass">{newPrice !== undefined ? formatBDT(newPrice) : "—"}</dd>
      </div>
      {difference !== undefined && (
        <div>
          <dt className="inline text-gray">পার্থক্য: </dt>
          <dd className={`inline font-mono font-medium ${difference > 0 ? "text-red" : "text-teal"}`}>
            {difference > 0 ? "+" : "-"}
            {formatBDT(Math.abs(difference))}
          </dd>
        </div>
      )}
    </dl>
  );
}

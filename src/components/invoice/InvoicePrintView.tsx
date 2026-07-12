import { formatBnDate } from "@/utils/date";
import type { Invoice } from "@/types/invoice.types";

const COMPANY_NAME = "OBM সোর্সিং";

/**
 * A dedicated print-only layout for an invoice — the on-screen invoice (with
 * prices, status stepper, notes, action buttons, etc.) stays completely
 * unchanged; this renders in parallel and is the only thing visible when the
 * page is printed or saved as PDF (`hidden print:block`, mirroring how the
 * sidebar/breadcrumb already hide themselves via `print:hidden`).
 *
 * Deliberately excludes anything price- or workflow-related (line totals,
 * grand total, order status, tracking steps, vendor rating, internal notes) —
 * this is a dispatch/goods-note style document for physical hand-off, not a
 * screen for tracking order state. To add another printable field, extend the
 * header grid or the table columns below; nothing outside this file needs to
 * change.
 */
export function InvoicePrintView({ invoice }: { invoice: Invoice }) {
  return (
    <div className="hidden print:block">
      <div className="mb-6 flex items-start justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-black font-sans text-sm font-bold text-white">
            OS
          </span>
          <div>
            <div className="font-serif text-xl font-bold text-black">{COMPANY_NAME}</div>
            <div className="text-xs text-black">ক্রয় আদেশ / চালান</div>
          </div>
        </div>
        <div className="text-right text-sm text-black">
          <div className="font-mono font-bold">INVOICE #{invoice.invoiceNumber}</div>
          <div>তারিখ: {formatBnDate(invoice.orderedAt)}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-black">ভেন্ডর তথ্য</div>
        <div className="text-sm text-black">
          <div className="font-serif text-base font-bold">{invoice.vendorName}</div>
          <div>{invoice.vendorAddress}</div>
          <div>ফোন: {invoice.vendorPhone}</div>
        </div>
      </div>

      <table className="mb-8 w-full border-collapse text-sm text-black">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1.5 text-left">প্রোডাক্ট</th>
            <th className="border border-black px-2 py-1.5 text-left">ইউনিট</th>
            <th className="border border-black px-2 py-1.5 text-left">পরিমাণ</th>
            <th className="border border-black px-2 py-1.5 text-left">মন্তব্য</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td className="border border-black px-2 py-1.5">{item.productName}</td>
              <td className="border border-black px-2 py-1.5">{item.unit}</td>
              <td className="border border-black px-2 py-1.5">{item.orderedQty}</td>
              <td className="border border-black px-2 py-1.5">{item.remark || "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-16 grid grid-cols-3 gap-6 text-center text-sm text-black">
        <div>
          <div className="h-12 border-b border-black" />
          <div className="mt-1 font-semibold">প্রস্তুতকারী (Prepared By)</div>
          <div className="text-xs">{invoice.orderedByName}</div>
        </div>
        <div>
          <div className="h-12 border-b border-black" />
          <div className="mt-1 font-semibold">গ্রহণকারী (Received By)</div>
        </div>
        <div>
          <div className="h-12 border-b border-black" />
          <div className="mt-1 font-semibold">অনুমোদনকারী (Authorized By)</div>
        </div>
      </div>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Clock, Package, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/utils/currency";
import type { InvoiceListItem } from "@/types/invoice.types";

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  isPrice,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  description?: string;
  isPrice?: boolean;
}) {
  return (
    <div className="rounded-md border border-line bg-white px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-panel sm:px-4 sm:py-3.5 lg:px-[18px] lg:py-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-paper-2 text-teal sm:h-9 sm:w-9">
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      </div>
      <div className="mb-1 text-[0.625rem] font-semibold text-gray sm:mb-1.5 sm:text-xs lg:text-[0.71875rem]">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-lg font-semibold sm:text-xl lg:text-2xl",
          isPrice ? "text-brass" : "text-teal-dark",
        )}
      >
        {value}
      </div>
      {description && <div className="mt-1 text-[0.625rem] text-gray sm:text-[0.6875rem]">{description}</div>}
    </div>
  );
}

/** Auto-computed from the vendor's real invoice list — every figure here is
 * derived (count/sum), never a fixed number, so it stays correct as orders
 * are created and move through the pipeline. */
export function OrderHistorySummaryCards({ invoices }: { invoices: InvoiceListItem[] }) {
  const totalOrders = invoices.length;
  const closedOrders = invoices.filter((inv) => inv.status === "CLOSED").length;
  const pendingInvoices = invoices.filter((inv) => inv.status === "IN_TRANSIT").length;
  const discrepancyOrders = invoices.filter((inv) => inv.status === "DISCREPANCY").length;
  const totalProcurementCost = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="mb-3.5 grid grid-cols-1 gap-3 sm:mb-4 sm:grid-cols-2 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-5">
      <SummaryCard icon={Package} label="মোট অর্ডার" value={`${totalOrders} টি`} description="সর্বমোট পারচেজ অর্ডার" />
      <SummaryCard
        icon={CheckCircle2}
        label="ক্লোজড অর্ডার"
        value={`${closedOrders} টি`}
        description="সফলভাবে সম্পন্ন হয়েছে"
      />
      <SummaryCard
        icon={Clock}
        label="পেন্ডিং ইনভয়েস"
        value={`${pendingInvoices} টি`}
        description="ওয়্যারহাউজ রিসিভের অপেক্ষায়"
      />
      <SummaryCard
        icon={AlertTriangle}
        label="ডিসক্রেপান্সি অর্ডার"
        value={`${discrepancyOrders} টি`}
        description="কোয়ান্টিটি মিসম্যাচ আছে"
      />
      <SummaryCard
        icon={Wallet}
        label="মোট প্রোকিউরমেন্ট কস্ট"
        value={formatBDT(totalProcurementCost)}
        description="সব অর্ডারের সমষ্টি"
        isPrice
      />
    </div>
  );
}

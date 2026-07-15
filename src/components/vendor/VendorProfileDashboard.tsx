"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Package, CheckCircle2, Ban, ShoppingCart, Clock3, Star, CalendarClock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/product/StarRating";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useVendorInvoices } from "@/hooks/useInvoices";
import { useUpdateVendorRating } from "@/hooks/useVendors";
import { formatBnDate, toBnDigits } from "@/utils/date";
import type { VendorWithProducts } from "@/types/vendor.types";

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-panel sm:px-4 sm:py-3.5 lg:px-[18px] lg:py-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-paper-2 text-teal sm:h-9 sm:w-9">
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      </div>
      <div className="mb-1 text-[0.625rem] font-semibold text-gray sm:mb-1.5 sm:text-xs lg:text-[0.71875rem]">
        {label}
      </div>
      <div className="font-mono text-lg font-semibold text-teal-dark sm:text-xl lg:text-2xl">{value}</div>
    </div>
  );
}

/** "প্রোফাইল" tab's summary dashboard — replaces the old raw product/price
 * table with an at-a-glance view of this vendor's catalog + order history,
 * plus the vendor's own overall rating (distinct from its per-product
 * ratings, which stay editable from the Product Edit modal as before). */
export function VendorProfileDashboard({ vendor }: { vendor: VendorWithProducts }) {
  const { data: invoices } = useVendorInvoices(vendor.id);
  const updateRating = useUpdateVendorRating();
  const [pendingRating, setPendingRating] = useState<number | null>(null);

  const totalProducts = vendor.productCount;
  const activeProducts = vendor.products.filter((p) => p.productStatus === "ACTIVE").length;
  const inactiveProducts = vendor.products.filter((p) => p.productStatus === "INACTIVE").length;

  const invoiceList = invoices ?? [];
  const totalOrders = invoiceList.length;
  const completedOrders = invoiceList.filter((inv) => inv.status === "CLOSED").length;
  const pendingOrders = totalOrders - completedOrders;
  const lastOrderDate = invoiceList.length
    ? formatBnDate(
        invoiceList.reduce((latest, inv) => (inv.orderedAt > latest ? inv.orderedAt : latest), invoiceList[0]!.orderedAt),
      )
    : "—";

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 md:grid-cols-4">
        <StatCard icon={Package} label="মোট প্রোডাক্ট" value={`${toBnDigits(totalProducts)} টি`} />
        <StatCard icon={CheckCircle2} label="অ্যাক্টিভ প্রোডাক্ট" value={`${toBnDigits(activeProducts)} টি`} />
        <StatCard icon={Ban} label="ইনঅ্যাক্টিভ প্রোডাক্ট" value={`${toBnDigits(inactiveProducts)} টি`} />
        <StatCard icon={ShoppingCart} label="মোট অর্ডার" value={`${toBnDigits(totalOrders)} টি`} />
        <StatCard icon={CheckCircle2} label="সম্পন্ন অর্ডার" value={`${toBnDigits(completedOrders)} টি`} />
        <StatCard icon={Clock3} label="পেন্ডিং অর্ডার" value={`${toBnDigits(pendingOrders)} টি`} />
        <StatCard icon={Star} label="ভেন্ডর রেটিং" value={`${toBnDigits(vendor.rating)} / ৫`} />
        <StatCard icon={CalendarClock} label="সর্বশেষ অর্ডার" value={lastOrderDate} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ভেন্ডর রেটিং</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-1.5 p-3 sm:p-4">
          <StarRating
            value={vendor.rating}
            onChange={(value) => setPendingRating(value)}
            iconClassName="h-5 w-5 sm:h-6 sm:w-6"
          />
          <p className="m-0 text-[11px] text-gray sm:text-xs">
            স্টারে ক্লিক করলে নিশ্চিতকরণের পর এই ভেন্ডরের রেটিং সংরক্ষণ হবে।
          </p>
        </div>
      </Card>

      <ConfirmDialog
        trigger={<span className="hidden" />}
        open={pendingRating !== null}
        onOpenChange={(open) => !open && setPendingRating(null)}
        title="ভেন্ডর রেটিং পরিবর্তন করবেন?"
        description={
          pendingRating !== null
            ? `আপনি কি নিশ্চিত এই ভেন্ডরের রেটিং ${toBnDigits(vendor.rating)} থেকে ${toBnDigits(pendingRating)} এ পরিবর্তন করতে চান?`
            : undefined
        }
        confirmLabel="নিশ্চিত করুন"
        onConfirm={() => {
          if (pendingRating === null) return;
          updateRating.mutate(
            { id: vendor.id, rating: pendingRating },
            { onSuccess: () => setPendingRating(null) },
          );
        }}
        isLoading={updateRating.isPending}
      />
    </div>
  );
}

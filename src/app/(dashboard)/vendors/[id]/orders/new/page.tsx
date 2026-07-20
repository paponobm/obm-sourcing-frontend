"use client";

import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderCreatePanel } from "@/components/vendor/OrderCreatePanel";
import { useVendor } from "@/hooks/useVendor";
import { ROUTES } from "@/constants/routes";
import { goBackOrFallback } from "@/lib/utils";

export default function NewVendorOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: vendor, isLoading } = useVendor(id);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!vendor) {
    return <EmptyState title="ভেন্ডর পাওয়া যায়নি" />;
  }

  if (vendor.status === "INACTIVE") {
    return (
      <EmptyState
        title="ইনঅ্যাক্টিভ ভেন্ডরের জন্য নতুন অর্ডার তৈরি করা যাবে না"
        description="নতুন অর্ডার তৈরি করতে হলে আগে এই ভেন্ডরকে সক্রিয় করুন।"
      />
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: "ভেন্ডর তালিকা", href: ROUTES.vendors },
          { label: vendor.shopName, href: ROUTES.vendorDetail(vendor.id) },
          { label: "নতুন অর্ডার" },
        ]}
      />

      <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:mb-5">
        <h2 className="m-0 font-serif text-base text-teal-dark sm:text-lg lg:text-[1.1875rem] xl:text-xl">
          নতুন অর্ডার তৈরি করুন — {vendor.shopName}
        </h2>
        <span className="text-xs text-gray sm:text-sm">Vendor ID: {vendor.vendorCode}</span>
      </div>

      <OrderCreatePanel
        vendor={vendor}
        onCreated={(invoiceId) => router.push(ROUTES.invoiceDetail(invoiceId))}
        onCancel={() => goBackOrFallback(router, ROUTES.vendorDetail(vendor.id))}
      />
    </>
  );
}

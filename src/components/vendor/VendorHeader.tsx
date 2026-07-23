import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ROUTES } from "@/constants/routes";
import type { Vendor } from "@/types/vendor.types";

export function VendorHeader({ vendor }: { vendor: Vendor }) {
  return (
    <div className="mb-4 sm:mb-5">
      <Breadcrumb
        items={[
          { label: "ড্যাশবোর্ড", href: ROUTES.dashboard },
          { label: "ভেন্ডর তালিকা", href: ROUTES.vendors },
          { label: vendor.shopName },
        ]}
      />
      <div className="flex flex-col justify-between gap-1 print:hidden sm:flex-row sm:items-center">
        <h2 className="m-0 font-serif text-base text-teal-dark sm:text-lg lg:text-[1.1875rem] xl:text-xl">
          {vendor.shopName}
        </h2>
        <span className="text-xs text-brass sm:text-sm">Vendor ID: {vendor.vendorCode}</span>
      </div>
    </div>
  );
}

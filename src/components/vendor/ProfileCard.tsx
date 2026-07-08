import { Badge } from "@/components/ui/badge";
import { InfoRow } from "./InfoRow";
import { vendorStatusBadgeVariant, VENDOR_STATUS_LABEL_BN } from "@/utils/status";
import type { Vendor } from "@/types/vendor.types";

export function ProfileCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="rounded-md border border-line bg-white p-4 sm:p-[18px] lg:p-5">
      {vendor.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={vendor.imageUrl}
          alt=""
          className="mb-3 h-28 w-full rounded-md object-cover sm:mb-3.5 sm:h-32 lg:h-36"
        />
      )}
      <div className="font-serif text-base text-teal-dark sm:text-lg lg:text-xl">
        {vendor.shopName}
      </div>
      <div className="mb-3 text-[11px] text-gray sm:mb-3.5 sm:text-xs lg:text-sm">
        Vendor ID: {vendor.vendorCode}
      </div>

      <InfoRow label="ঠিকানা" value={vendor.address} />
      <InfoRow label="হোয়াটসঅ্যাপ" value={vendor.whatsapp} mono />
      <InfoRow label="ফোন নাম্বার" value={vendor.phone} mono />
      <InfoRow label="যোগাযোগ ব্যক্তি" value={vendor.contactPerson} />
      <InfoRow
        label="স্ট্যাটাস"
        value={
          <Badge variant={vendorStatusBadgeVariant(vendor.status)}>
            {VENDOR_STATUS_LABEL_BN[vendor.status]}
          </Badge>
        }
      />
      <InfoRow label="মোট প্রোডাক্ট" value={`${vendor.productCount} টি`} noBorder />
    </div>
  );
}

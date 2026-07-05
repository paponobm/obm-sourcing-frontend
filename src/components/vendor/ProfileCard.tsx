import { Badge } from "@/components/ui/badge";
import { InfoRow } from "./InfoRow";
import { vendorStatusBadgeVariant, VENDOR_STATUS_LABEL_BN } from "@/utils/status";
import type { Vendor } from "@/types/vendor.types";

export function ProfileCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="rounded-md border border-line bg-white p-5">
      <div className="font-serif text-lg text-teal-dark">{vendor.shopName}</div>
      <div className="mb-3.5 text-xs text-gray">Vendor ID: {vendor.vendorCode}</div>

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

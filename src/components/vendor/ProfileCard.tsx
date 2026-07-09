"use client";

import { useState } from "react";
import { Camera, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InfoRow } from "./InfoRow";
import { VendorImageEditForm } from "@/components/forms/VendorImageEditForm";
import { useHasRole } from "@/hooks/useHasRole";
import { MANAGE_CATALOG_ROLES } from "@/constants/roles";
import { vendorStatusBadgeVariant, VENDOR_STATUS_LABEL_BN } from "@/utils/status";
import type { Vendor } from "@/types/vendor.types";

export function ProfileCard({ vendor }: { vendor: Vendor }) {
  const [editingImage, setEditingImage] = useState(false);
  const canManage = useHasRole(MANAGE_CATALOG_ROLES);

  return (
    <div className="rounded-md border border-line bg-white p-4 sm:p-[18px] lg:p-5">
      <div className="relative mb-3 sm:mb-3.5">
        {vendor.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.imageUrl}
            alt=""
            className="h-28 w-full rounded-md object-cover sm:h-32 lg:h-36"
          />
        ) : (
          <div className="flex h-28 w-full items-center justify-center rounded-md bg-paper-2 sm:h-32 lg:h-36">
            <Store className="h-8 w-8 text-line" strokeWidth={1.5} />
          </div>
        )}
        {canManage && (
          <button
            type="button"
            onClick={() => setEditingImage(true)}
            aria-label="ভেন্ডরের ছবি পরিবর্তন করুন"
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-teal-dark shadow-panel transition-transform hover:scale-105"
          >
            <Camera className="h-4 w-4" />
          </button>
        )}
      </div>

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

      {canManage && (
        <Dialog open={editingImage} onOpenChange={setEditingImage}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ভেন্ডরের ছবি পরিবর্তন করুন</DialogTitle>
              <DialogDescription>{vendor.shopName}-এর জন্য নতুন ছবি আপলোড করুন।</DialogDescription>
            </DialogHeader>
            <VendorImageEditForm
              vendorId={vendor.id}
              currentImageUrl={vendor.imageUrl}
              onSuccess={() => setEditingImage(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

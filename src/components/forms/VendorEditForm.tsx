"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema, type VendorFormValues } from "@/lib/validations/vendor.schema";
import { useUpdateVendor } from "@/hooks/useVendors";
import { useUploadImage } from "@/hooks/useUploadImage";
import { resolveImageValue, type ImageValue } from "@/lib/image-value";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { FormField } from "./FormField";
import { FormGrid } from "./FormGrid";
import type { Vendor } from "@/types/vendor.types";

/** Edits a vendor's own profile fields — deliberately excludes `status`,
 * which only changes via the Vendor List's dedicated Activate/Deactivate
 * action (so the product cascade can never be bypassed by this form). */
export function VendorEditForm({
  vendor,
  onSuccess,
  onCancel,
}: {
  vendor: Vendor;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const updateVendor = useUpdateVendor();
  const uploadImage = useUploadImage();
  const [imageValue, setImageValue] = useState<ImageValue>(vendor.imageUrl);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      shopName: vendor.shopName,
      contactPerson: vendor.contactPerson,
      address: vendor.address,
      whatsapp: vendor.whatsapp,
      phone: vendor.phone,
      note: vendor.note ?? "",
    },
  });

  const onSubmit = async (values: VendorFormValues) => {
    const imageUrl = await resolveImageValue(imageValue, (file) => uploadImage.mutateAsync(file));
    updateVendor.mutate({ id: vendor.id, input: { ...values, imageUrl } }, { onSuccess });
  };

  const isPending = uploadImage.isPending || updateVendor.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormGrid>
        <div className="col-span-full">
          <Label>ছবি (ঐচ্ছিক)</Label>
          <ImageUploadField value={imageValue} onChange={setImageValue} />
        </div>
        <FormField label="দোকানের নাম" htmlFor="edit-shopName" error={errors.shopName?.message}>
          <Input
            id="edit-shopName"
            placeholder="যেমন: মেঘনা ট্রেডার্স"
            invalid={Boolean(errors.shopName)}
            {...register("shopName")}
          />
        </FormField>
        <FormField label="যোগাযোগ ব্যক্তির নাম" htmlFor="edit-contactPerson" error={errors.contactPerson?.message}>
          <Input
            id="edit-contactPerson"
            placeholder="যেমন: মো. কামাল"
            invalid={Boolean(errors.contactPerson)}
            {...register("contactPerson")}
          />
        </FormField>
        <FormField label="ঠিকানা" htmlFor="edit-address" error={errors.address?.message} full>
          <Input
            id="edit-address"
            placeholder="চকবাজার, চট্টগ্রাম"
            invalid={Boolean(errors.address)}
            {...register("address")}
          />
        </FormField>
        <FormField label="হোয়াটসঅ্যাপ নাম্বার" htmlFor="edit-whatsapp" error={errors.whatsapp?.message}>
          <Input
            id="edit-whatsapp"
            placeholder="01XXXXXXXXX"
            invalid={Boolean(errors.whatsapp)}
            {...register("whatsapp")}
          />
        </FormField>
        <FormField label="ফোন নাম্বার" htmlFor="edit-phone" error={errors.phone?.message}>
          <Input id="edit-phone" placeholder="01XXXXXXXXX" invalid={Boolean(errors.phone)} {...register("phone")} />
        </FormField>
        <FormField label="নোট / মন্তব্য (ঐচ্ছিক)" htmlFor="edit-note" full>
          <Textarea id="edit-note" placeholder="যেমন: শুক্রবার বন্ধ থাকে, অগ্রিম পেমেন্ট লাগে" {...register("note")} />
        </FormField>
      </FormGrid>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          বাতিল
        </Button>
        <Button type="submit" variant="brass" disabled={isPending}>
          {isPending ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

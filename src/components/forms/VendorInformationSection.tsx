"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { VendorRow } from "./VendorRow";
import { AddVendorButton } from "./AddVendorButton";
import type { ProductFormValues } from "@/lib/validations/product.schema";

type VendorOption = { id: string; shopName: string };
type VendorFieldArrayItem = { id: string };

export function VendorInformationSection({
  fields,
  control,
  register,
  errors,
  watchedVendorPrices,
  vendors,
  vendorsLoading,
  onAppend,
  onRemove,
}: {
  fields: VendorFieldArrayItem[];
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  watchedVendorPrices: { vendorId: string }[];
  vendors?: VendorOption[];
  vendorsLoading: boolean;
  onAppend: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <Label>ভেন্ডর ও দাম</Label>
      {errors.vendorPrices?.message && (
        <p className="mb-1.5 text-[11px] text-red sm:text-xs">{errors.vendorPrices.message}</p>
      )}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <VendorRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            errors={errors}
            vendors={vendors}
            vendorsLoading={vendorsLoading}
            excludeVendorIds={watchedVendorPrices.filter((_, i) => i !== index).map((vp) => vp.vendorId)}
            onRemove={() => onRemove(index)}
            removeDisabled={fields.length === 1}
          />
        ))}
      </div>
      <AddVendorButton onClick={onAppend} />
    </div>
  );
}

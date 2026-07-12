"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { VendorRow } from "./VendorRow";
import { AddVendorButton } from "./AddVendorButton";

type VendorOption = { id: string; shopName: string };
type VendorFieldArrayItem = { id: string };
type VendorPriceFields = { vendorPrices: { vendorId: string; price: string; rating: number }[] };

/** Generic over any form shape with a `vendorPrices` field array — shared by
 * the product create form and the Pending-product approve modal. */
export function VendorInformationSection<TFieldValues extends VendorPriceFields>({
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
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  watchedVendorPrices: { vendorId: string }[];
  vendors?: VendorOption[];
  vendorsLoading: boolean;
  onAppend: () => void;
  onRemove: (index: number) => void;
}) {
  // Same generic-FieldErrors narrowing as VendorRow — this is the array-level
  // message (e.g. "কমপক্ষে একটি ভেন্ডর যোগ করুন"), not a per-row one.
  const vendorPricesError = errors.vendorPrices as unknown as { message?: string } | undefined;

  return (
    <div>
      <Label>ভেন্ডর ও দাম</Label>
      {vendorPricesError?.message && (
        <p className="mb-1.5 text-[11px] text-red sm:text-xs">{vendorPricesError.message}</p>
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

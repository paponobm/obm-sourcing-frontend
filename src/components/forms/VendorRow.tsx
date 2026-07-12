"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { StarRating } from "@/components/product/StarRating";

type VendorOption = { id: string; shopName: string };
type VendorPriceFields = { vendorPrices: { vendorId: string; price: string; rating: number }[] };

/** One vendor's dropdown + price + rating + remove — all on a single row on
 * tablet/desktop, stacking only on mobile. Multiple rows stay equal-width and
 * column-aligned since each field has a fixed width at sm+. Generic so it's
 * reusable by any form that has a `vendorPrices` field array (product
 * create, product approve, ...), not just `ProductFormValues`. */
export function VendorRow<TFieldValues extends VendorPriceFields>({
  index,
  control,
  register,
  errors,
  vendors,
  vendorsLoading,
  excludeVendorIds,
  onRemove,
  removeDisabled,
}: {
  index: number;
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  vendors?: VendorOption[];
  vendorsLoading: boolean;
  excludeVendorIds: string[];
  onRemove: () => void;
  removeDisabled: boolean;
}) {
  // react-hook-form can't fully resolve FieldErrors for a generic
  // TFieldValues constrained only by `vendorPrices`'s shape — narrowed here
  // to the one shape every caller (ProductForm, ApproveProductModal) shares.
  const vendorPriceErrors = errors.vendorPrices as unknown as
    | { vendorId?: { message?: string }; price?: { message?: string }; rating?: { message?: string } }[]
    | undefined;
  const rowErrors = vendorPriceErrors?.[index];

  return (
    <div className="rounded-md border border-line p-2.5 sm:p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
        <div className="sm:w-44 lg:w-48">
          <Controller
            control={control}
            name={`vendorPrices.${index}.vendorId` as never}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={rowErrors?.vendorId ? "border-red" : undefined}>
                  <SelectValue placeholder={vendorsLoading ? "লোড হচ্ছে..." : "ভেন্ডর নির্বাচন করুন"} />
                </SelectTrigger>
                <SelectContent>
                  {vendors
                    ?.filter((v) => !excludeVendorIds.includes(v.id))
                    .map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.shopName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="sm:w-28">
          <Input
            type="number"
            min={0}
            placeholder="দাম (৳)"
            invalid={Boolean(rowErrors?.price)}
            {...register(`vendorPrices.${index}.price` as never)}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:shrink-0">
          <span className="text-xs text-gray sm:hidden">রেটিং:</span>
          <Controller
            control={control}
            name={`vendorPrices.${index}.rating` as never}
            render={({ field }) => (
              <StarRating value={field.value} onChange={field.onChange} iconClassName="h-4 w-4" />
            )}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="sm:ml-auto sm:shrink-0"
          disabled={removeDisabled}
          onClick={onRemove}
          aria-label="ভেন্ডর সরান"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {(rowErrors?.vendorId || rowErrors?.price || rowErrors?.rating) && (
        <div className="mt-1 space-y-0.5">
          {rowErrors?.vendorId && <p className="text-[11px] text-red sm:text-xs">{rowErrors.vendorId.message}</p>}
          {rowErrors?.price && <p className="text-[11px] text-red sm:text-xs">{rowErrors.price.message}</p>}
          {rowErrors?.rating && <p className="text-[11px] text-red sm:text-xs">{rowErrors.rating.message}</p>}
        </div>
      )}
    </div>
  );
}

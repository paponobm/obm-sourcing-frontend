"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormWatch } from "react-hook-form";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableProductSelect, type SearchableProductOption } from "@/components/shared/SearchableProductSelect";
import type { RequisitionFormValues } from "@/lib/validations/requisition.schema";

type ProductOption = SearchableProductOption & { unit: string };

/** One product line within a multi-product requisition — product, its
 * auto-derived (read-only) unit, required quantity, and optional notes. */
export function RequisitionItemRow({
  index,
  control,
  register,
  watch,
  errors,
  products,
  productsLoading,
  onRemove,
  removeDisabled,
}: {
  index: number;
  control: Control<RequisitionFormValues>;
  register: UseFormRegister<RequisitionFormValues>;
  watch: UseFormWatch<RequisitionFormValues>;
  errors: FieldErrors<RequisitionFormValues>;
  products: ProductOption[];
  productsLoading: boolean;
  onRemove: () => void;
  removeDisabled: boolean;
}) {
  const productId = watch(`items.${index}.productId`);
  const selectedProduct = products.find((p) => p.id === productId);
  const rowErrors = errors.items?.[index];

  return (
    <div className="rounded-md border border-line p-2.5 sm:p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-2.5">
        <div className="sm:w-56 lg:w-64">
          <Controller
            control={control}
            name={`items.${index}.productId`}
            render={({ field }) => (
              <SearchableProductSelect
                products={products}
                value={field.value}
                onChange={field.onChange}
                isLoading={productsLoading}
                invalid={Boolean(rowErrors?.productId)}
              />
            )}
          />
          {rowErrors?.productId && (
            <p className="mt-1 text-[11px] text-red sm:text-xs">{rowErrors.productId.message}</p>
          )}
        </div>

        <div className="flex h-9 items-center text-xs text-gray sm:h-10 sm:w-20 sm:text-sm">
          {selectedProduct?.unit ?? "—"}
        </div>

        <div className="sm:w-24">
          <Input
            type="number"
            min={1}
            placeholder="পরিমাণ"
            invalid={Boolean(rowErrors?.requiredQty)}
            {...register(`items.${index}.requiredQty`)}
          />
          {rowErrors?.requiredQty && (
            <p className="mt-1 text-[11px] text-red sm:text-xs">{rowErrors.requiredQty.message}</p>
          )}
        </div>

        <div className="flex-1">
          <Input placeholder="নোট (ঐচ্ছিক)" {...register(`items.${index}.notes`)} />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="sm:shrink-0"
          disabled={removeDisabled}
          onClick={onRemove}
          aria-label="প্রোডাক্ট সরান"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

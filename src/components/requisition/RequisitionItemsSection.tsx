"use client";

import { Plus } from "lucide-react";
import type { Control, FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RequisitionItemRow } from "./RequisitionItemRow";
import type { SearchableProductOption } from "@/components/shared/SearchableProductSelect";
import type { RequisitionFormValues } from "@/lib/validations/requisition.schema";

type ProductOption = SearchableProductOption & { unit: string };
type FieldArrayItem = { id: string };

/** No row limit — "আরও প্রোডাক্ট যোগ করুন" appends indefinitely. */
export function RequisitionItemsSection({
  fields,
  control,
  register,
  watch,
  errors,
  products,
  productsLoading,
  onAppend,
  onRemove,
}: {
  fields: FieldArrayItem[];
  control: Control<RequisitionFormValues>;
  register: UseFormRegister<RequisitionFormValues>;
  watch: UseFormWatch<RequisitionFormValues>;
  errors: FieldErrors<RequisitionFormValues>;
  products: ProductOption[];
  productsLoading: boolean;
  onAppend: () => void;
  onRemove: (index: number) => void;
}) {
  const itemsError = errors.items as unknown as { message?: string } | undefined;

  return (
    <div>
      <Label>প্রোডাক্ট তালিকা</Label>
      {itemsError?.message && <p className="mb-1.5 text-[11px] text-red sm:text-xs">{itemsError.message}</p>}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <RequisitionItemRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            watch={watch}
            errors={errors}
            products={products}
            productsLoading={productsLoading}
            onRemove={() => onRemove(index)}
            removeDisabled={fields.length === 1}
          />
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onAppend}>
        <Plus className="h-3.5 w-3.5" /> আরও প্রোডাক্ট যোগ করুন
      </Button>
    </div>
  );
}

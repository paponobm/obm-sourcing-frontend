"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  vendorProductEditSchema,
  type VendorProductEditFormValues,
} from "@/lib/validations/product.schema";
import { useSetVendorProductPrice } from "@/hooks/useVendors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { StarRating } from "@/components/product/StarRating";
import { FormField } from "./FormField";

/** Edits one vendor's price+rating for a product — not the shared product fields (name/unit/category/sku). */
export function ProductEditForm({
  vendorId,
  productId,
  defaultValues,
  onSuccess,
}: {
  vendorId: string;
  productId: string;
  defaultValues: { price: number; rating: number };
  onSuccess: () => void;
}) {
  const setVendorProductPrice = useSetVendorProductPrice();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorProductEditFormValues>({
    resolver: zodResolver(vendorProductEditSchema),
    defaultValues: {
      price: String(defaultValues.price),
      rating: defaultValues.rating,
    },
  });

  const onSubmit = async (values: VendorProductEditFormValues) => {
    await setVendorProductPrice.mutateAsync({
      vendorId,
      productId,
      price: Number(values.price),
      rating: values.rating,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <FormField label="দাম (৳)" htmlFor="edit-price" error={errors.price?.message}>
        <Input id="edit-price" type="number" min={0} invalid={Boolean(errors.price)} {...register("price")} />
      </FormField>

      <FormField label="রেটিং" htmlFor="edit-rating" error={errors.rating?.message}>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => <StarRating value={field.value} onChange={field.onChange} size={18} />}
        />
      </FormField>

      <DialogFooter>
        <Button type="submit" variant="brass" disabled={setVendorProductPrice.isPending}>
          {setVendorProductPrice.isPending ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

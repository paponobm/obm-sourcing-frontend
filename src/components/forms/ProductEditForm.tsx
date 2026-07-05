"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productEditSchema, type ProductEditFormValues } from "@/lib/validations/product.schema";
import { useUpdateProduct } from "@/hooks/useProducts";
import { useSetVendorProductPrice } from "@/hooks/useVendors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FormField } from "./FormField";

export function ProductEditForm({
  vendorId,
  productId,
  defaultValues,
  onSuccess,
}: {
  vendorId: string;
  productId: string;
  defaultValues: { name: string; unit: string; category?: string; price: number };
  onSuccess: () => void;
}) {
  const updateProduct = useUpdateProduct();
  const setVendorProductPrice = useSetVendorProductPrice();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductEditFormValues>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: defaultValues.name,
      unit: defaultValues.unit,
      category: defaultValues.category ?? "",
      price: String(defaultValues.price),
    },
  });

  const onSubmit = async (values: ProductEditFormValues) => {
    await updateProduct.mutateAsync({
      id: productId,
      input: { name: values.name, unit: values.unit, category: values.category },
    });
    await setVendorProductPrice.mutateAsync({
      vendorId,
      productId,
      price: Number(values.price),
    });
    onSuccess();
  };

  const isPending = updateProduct.isPending || setVendorProductPrice.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <FormField label="প্রোডাক্টের নাম" htmlFor="edit-name" error={errors.name?.message}>
        <Input id="edit-name" invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>
      <FormField label="ইউনিট" htmlFor="edit-unit" error={errors.unit?.message}>
        <Input id="edit-unit" invalid={Boolean(errors.unit)} {...register("unit")} />
      </FormField>
      <FormField label="ক্যাটাগরি (ঐচ্ছিক)" htmlFor="edit-category">
        <Input id="edit-category" {...register("category")} />
      </FormField>
      <FormField label="দাম (৳)" htmlFor="edit-price" error={errors.price?.message}>
        <Input id="edit-price" type="number" min={0} invalid={Boolean(errors.price)} {...register("price")} />
      </FormField>

      <DialogFooter>
        <Button type="submit" variant="brass" disabled={isPending}>
          {isPending ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

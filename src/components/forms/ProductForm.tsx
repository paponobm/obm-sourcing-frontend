"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations/product.schema";
import { useCreateProduct } from "@/hooks/useProducts";
import { useVendors, useSetVendorProductPrice } from "@/hooks/useVendors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FormField } from "./FormField";

export function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const createProduct = useCreateProduct();
  const setVendorProductPrice = useSetVendorProductPrice();
  const { data: vendorsPage, isLoading: vendorsLoading } = useVendors({ page: 1, pageSize: 100 });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", unit: "", category: "", vendorId: "", price: "" },
  });

  const onSubmit = async (values: ProductFormValues) => {
    const product = await createProduct.mutateAsync({
      name: values.name,
      unit: values.unit,
      category: values.category,
    });

    await setVendorProductPrice.mutateAsync({
      vendorId: values.vendorId,
      productId: product.id,
      price: Number(values.price),
    });

    onSuccess();
  };

  const isPending = createProduct.isPending || setVendorProductPrice.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <FormField label="প্রোডাক্টের নাম" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="যেমন: আলফায়ার (শুকনা)" invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>
      <FormField label="ইউনিট" htmlFor="unit" error={errors.unit?.message}>
        <Input id="unit" placeholder="কেজি / প্যাকেট" invalid={Boolean(errors.unit)} {...register("unit")} />
      </FormField>
      <FormField label="ক্যাটাগরি (ঐচ্ছিক)" htmlFor="category">
        <Input id="category" placeholder="শুটকি" {...register("category")} />
      </FormField>

      <FormField label="ভেন্ডর" htmlFor="vendorId" error={errors.vendorId?.message}>
        <Controller
          control={control}
          name="vendorId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="vendorId">
                <SelectValue placeholder={vendorsLoading ? "লোড হচ্ছে..." : "ভেন্ডর নির্বাচন করুন"} />
              </SelectTrigger>
              <SelectContent>
                {vendorsPage?.data.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.shopName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField label="দাম (৳)" htmlFor="price" error={errors.price?.message}>
        <Input
          id="price"
          type="number"
          min={0}
          placeholder="যেমন: ১১২"
          invalid={Boolean(errors.price)}
          {...register("price")}
        />
      </FormField>

      <DialogFooter>
        <Button type="submit" variant="brass" disabled={isPending}>
          {isPending ? "সংরক্ষণ হচ্ছে..." : "প্রোডাক্ট সংরক্ষণ করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

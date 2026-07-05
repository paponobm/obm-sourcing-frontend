"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations/product.schema";
import { useCreateProduct } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FormField } from "./FormField";

export function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const createProduct = useCreateProduct();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", unit: "", category: "" },
  });

  const onSubmit = (values: ProductFormValues) => {
    createProduct.mutate(values, { onSuccess });
  };

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
      <DialogFooter>
        <Button type="submit" variant="brass" disabled={createProduct.isPending}>
          {createProduct.isPending ? "সংরক্ষণ হচ্ছে..." : "প্রোডাক্ট সংরক্ষণ করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

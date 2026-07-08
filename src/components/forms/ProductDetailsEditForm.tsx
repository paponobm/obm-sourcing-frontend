"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productDetailsEditSchema,
  type ProductDetailsEditFormValues,
} from "@/lib/validations/product.schema";
import { useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useUploadImage } from "@/hooks/useUploadImage";
import { resolveImageValue, resolveImageValues, type ImageValue } from "@/lib/image-value";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { MultiImageUploadField } from "@/components/shared/MultiImageUploadField";
import { FormField } from "./FormField";

/** Edits a product's shared fields (SKU/name/unit/category/images) — affects every vendor supplying it. */
export function ProductDetailsEditForm({
  productId,
  defaultValues,
  onSuccess,
}: {
  productId: string;
  defaultValues: {
    sku: string;
    name: string;
    unit: string;
    categoryId: string;
    thumbnailUrl?: string;
    imageUrls: string[];
  };
  onSuccess: () => void;
}) {
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadImage();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [thumbnailValue, setThumbnailValue] = useState<ImageValue>(defaultValues.thumbnailUrl);
  const [imageValues, setImageValues] = useState<(File | string)[]>(defaultValues.imageUrls);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductDetailsEditFormValues>({
    resolver: zodResolver(productDetailsEditSchema),
    defaultValues: {
      sku: defaultValues.sku,
      name: defaultValues.name,
      unit: defaultValues.unit,
      categoryId: defaultValues.categoryId,
    },
  });

  const onSubmit = async (values: ProductDetailsEditFormValues) => {
    const upload = (file: File) => uploadImage.mutateAsync(file);
    const [thumbnailUrl, imageUrls] = await Promise.all([
      resolveImageValue(thumbnailValue, upload),
      resolveImageValues(imageValues, upload),
    ]);

    await updateProduct.mutateAsync({ id: productId, input: { ...values, thumbnailUrl, imageUrls } });
    onSuccess();
  };

  const isPending = uploadImage.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <FormField label="SKU" htmlFor="details-sku" error={errors.sku?.message}>
        <Input id="details-sku" invalid={Boolean(errors.sku)} {...register("sku")} />
      </FormField>
      <FormField label="প্রোডাক্টের নাম" htmlFor="details-name" error={errors.name?.message}>
        <Input id="details-name" invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>
      <FormField label="ইউনিট" htmlFor="details-unit" error={errors.unit?.message}>
        <Input id="details-unit" invalid={Boolean(errors.unit)} {...register("unit")} />
      </FormField>
      <FormField label="ক্যাটাগরি" htmlFor="details-categoryId" error={errors.categoryId?.message}>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="details-categoryId">
                <SelectValue placeholder={categoriesLoading ? "লোড হচ্ছে..." : "ক্যাটাগরি নির্বাচন করুন"} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <div>
        <Label>থাম্বনেইল ছবি (ঐচ্ছিক)</Label>
        <ImageUploadField value={thumbnailValue} onChange={setThumbnailValue} />
      </div>

      <div>
        <Label>আরও ছবি (ঐচ্ছিক)</Label>
        <MultiImageUploadField value={imageValues} onChange={setImageValues} />
      </div>

      <DialogFooter>
        <Button type="submit" variant="brass" disabled={isPending}>
          {isPending ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

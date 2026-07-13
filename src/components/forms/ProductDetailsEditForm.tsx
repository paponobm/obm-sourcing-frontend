"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productDetailsEditSchema,
  type ProductDetailsEditFormValues,
} from "@/lib/validations/product.schema";
import { useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useUploadImage } from "@/hooks/useUploadImage";
import { resolveImageValue, resolveImageValues, type ImageValue } from "@/lib/image-value";
import { BasicInformationSection } from "./BasicInformationSection";
import { ImageUploadSection } from "./ImageUploadSection";
import { VendorInformationEditTable } from "./VendorInformationEditTable";
import { ActionButtons } from "./ActionButtons";
import type { ProductVendorEntry } from "@/types/product.types";

/** Edits a product's shared fields (SKU/name/unit/category/images) — affects
 * every vendor supplying it — plus, below that, each supplying vendor's own
 * price/rating/status (see VendorInformationEditTable, saved independently
 * per row). */
export function ProductDetailsEditForm({
  productId,
  defaultValues,
  vendors,
  onSuccess,
  onCancel,
}: {
  productId: string;
  defaultValues: {
    sku: string;
    name: string;
    unit: string;
    categoryIds: string[];
    description?: string;
    thumbnailUrl?: string;
    imageUrls: string[];
  };
  vendors: ProductVendorEntry[];
  onSuccess: () => void;
  onCancel: () => void;
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
      categoryIds: defaultValues.categoryIds,
      description: defaultValues.description ?? "",
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <BasicInformationSection
        register={register}
        control={control}
        errors={errors}
        categories={categories}
        categoriesLoading={categoriesLoading}
        idPrefix="details-"
      />

      <ImageUploadSection
        thumbnailValue={thumbnailValue}
        onThumbnailChange={setThumbnailValue}
        imageValues={imageValues}
        onImageValuesChange={setImageValues}
      />

      <VendorInformationEditTable productId={productId} vendors={vendors} />

      <ActionButtons
        onCancel={onCancel}
        isPending={isPending}
        savingLabel="সংরক্ষণ হচ্ছে..."
        saveLabel="পরিবর্তন সংরক্ষণ করুন"
      />
    </form>
  );
}

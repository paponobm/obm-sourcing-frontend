"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations/product.schema";
import { useCreateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useVendors, useSetVendorProductPrice } from "@/hooks/useVendors";
import { useUploadImage } from "@/hooks/useUploadImage";
import { resolveImageValue, resolveImageValues, type ImageValue } from "@/lib/image-value";
import { BasicInformationSection } from "./BasicInformationSection";
import { ImageUploadSection } from "./ImageUploadSection";
import { VendorInformationSection } from "./VendorInformationSection";
import { ActionButtons } from "./ActionButtons";

export function ProductForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const createProduct = useCreateProduct();
  const setVendorProductPrice = useSetVendorProductPrice();
  const uploadImage = useUploadImage();
  const { data: vendorsPage, isLoading: vendorsLoading } = useVendors({ page: 1, pageSize: 100 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [thumbnailValue, setThumbnailValue] = useState<ImageValue>();
  const [imageValues, setImageValues] = useState<(File | string)[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      unit: "",
      categoryId: "",
      vendorPrices: [{ vendorId: "", price: "", rating: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "vendorPrices" });
  const watchedVendorPrices = watch("vendorPrices");

  const onSubmit = async (values: ProductFormValues) => {
    const upload = (file: File) => uploadImage.mutateAsync(file);
    const [thumbnailUrl, imageUrls] = await Promise.all([
      resolveImageValue(thumbnailValue, upload),
      resolveImageValues(imageValues, upload),
    ]);

    const product = await createProduct.mutateAsync({
      sku: values.sku,
      name: values.name,
      unit: values.unit,
      categoryId: values.categoryId,
      thumbnailUrl,
      imageUrls,
    });

    await Promise.all(
      values.vendorPrices.map((vp) =>
        setVendorProductPrice.mutateAsync({
          vendorId: vp.vendorId,
          productId: product.id,
          price: Number(vp.price),
          rating: vp.rating,
        }),
      ),
    );

    onSuccess();
  };

  const isPending = uploadImage.isPending || createProduct.isPending || setVendorProductPrice.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <BasicInformationSection
        register={register}
        control={control}
        errors={errors}
        categories={categories}
        categoriesLoading={categoriesLoading}
      />

      <ImageUploadSection
        thumbnailValue={thumbnailValue}
        onThumbnailChange={setThumbnailValue}
        imageValues={imageValues}
        onImageValuesChange={setImageValues}
      />

      <VendorInformationSection
        fields={fields}
        control={control}
        register={register}
        errors={errors}
        watchedVendorPrices={watchedVendorPrices}
        vendors={vendorsPage?.data}
        vendorsLoading={vendorsLoading}
        onAppend={() => append({ vendorId: "", price: "", rating: 0 })}
        onRemove={remove}
      />

      <ActionButtons
        onCancel={onCancel}
        isPending={isPending}
        savingLabel="সংরক্ষণ হচ্ছে..."
        saveLabel="প্রোডাক্ট সংরক্ষণ করুন"
      />
    </form>
  );
}

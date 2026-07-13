"use client";

import { useState } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  managerProductCreateSchema,
  type ProductFormValues,
} from "@/lib/validations/product.schema";
import { useCreateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useVendors, useSetVendorProductPrice } from "@/hooks/useVendors";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useHasRole } from "@/hooks/useHasRole";
import { SUPER_ADMIN_ONLY } from "@/constants/roles";
import { resolveImageValue, resolveImageValues, type ImageValue } from "@/lib/image-value";
import { BasicInformationSection } from "./BasicInformationSection";
import { ImageUploadSection } from "./ImageUploadSection";
import { VendorInformationSection } from "./VendorInformationSection";
import { ActionButtons } from "./ActionButtons";

export function ProductForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const createProduct = useCreateProduct();
  const setVendorProductPrice = useSetVendorProductPrice();
  const uploadImage = useUploadImage();
  const isSuperAdmin = useHasRole(SUPER_ADMIN_ONLY);
  const { data: vendorsPage, isLoading: vendorsLoading } = useVendors({ page: 1, pageSize: 100 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [thumbnailValue, setThumbnailValue] = useState<ImageValue>();
  const [imageValues, setImageValues] = useState<(File | string)[]>([]);

  // A Manager's submission goes to Pending with no vendor/price at all (see
  // ApproveProductModal, where an Admin assigns those later) — the vendor
  // section only renders, and is only validated, for a Super Admin's own
  // direct-create flow, which keeps today's behavior unchanged.
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: (isSuperAdmin
      ? zodResolver(productSchema)
      : zodResolver(managerProductCreateSchema)) as unknown as Resolver<ProductFormValues>,
    defaultValues: {
      sku: "",
      name: "",
      unit: "",
      categoryIds: [],
      description: "",
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
      categoryIds: values.categoryIds,
      description: values.description || undefined,
      thumbnailUrl,
      imageUrls,
    });

    if (isSuperAdmin) {
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
    }

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

      {isSuperAdmin && (
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
      )}

      <ActionButtons
        onCancel={onCancel}
        isPending={isPending}
        savingLabel="সংরক্ষণ হচ্ছে..."
        saveLabel="প্রোডাক্ট সংরক্ষণ করুন"
      />
    </form>
  );
}

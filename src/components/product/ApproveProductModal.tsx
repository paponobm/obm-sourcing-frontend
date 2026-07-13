"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BasicInformationSection } from "@/components/forms/BasicInformationSection";
import { ImageUploadSection } from "@/components/forms/ImageUploadSection";
import { VendorInformationSection } from "@/components/forms/VendorInformationSection";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { productSchema, type ProductFormValues } from "@/lib/validations/product.schema";
import { useApproveProduct } from "@/hooks/useProducts";
import { useVendors } from "@/hooks/useVendors";
import { useCategories } from "@/hooks/useCategories";
import { useUploadImage } from "@/hooks/useUploadImage";
import { resolveImageValue, resolveImageValues, type ImageValue } from "@/lib/image-value";
import type { PendingProduct } from "@/types/product.types";

/** Approving a Pending product shows the Manager's full submission — name,
 * SKU, unit, category, description, images — pre-filled and editable, so the
 * Admin can correct anything before it goes live, alongside assigning
 * vendor(s)/price/rating (the one thing a Manager could never set). */
export function ApproveProductModal({
  product,
  onOpenChange,
  onSuccess,
}: {
  product: PendingProduct | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const approveProduct = useApproveProduct();
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
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
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

  // Pre-fill with this product's current (Manager-submitted) data each time
  // a different product opens.
  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku,
        name: product.name,
        unit: product.unit,
        categoryIds: product.categories.map((c) => c.id),
        description: product.description ?? "",
        vendorPrices: [{ vendorId: "", price: "", rating: 0 }],
      });
      setThumbnailValue(product.thumbnailUrl);
      setImageValues(product.imageUrls);
    }
  }, [product, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    if (!product) return;
    const upload = (file: File) => uploadImage.mutateAsync(file);
    const [thumbnailUrl, imageUrls] = await Promise.all([
      resolveImageValue(thumbnailValue, upload),
      resolveImageValues(imageValues, upload),
    ]);

    await approveProduct.mutateAsync({
      id: product.id,
      input: {
        name: values.name,
        sku: values.sku,
        unit: values.unit,
        categoryIds: values.categoryIds,
        description: values.description || undefined,
        thumbnailUrl,
        imageUrls,
        vendors: values.vendorPrices.map((vp) => ({
          vendorId: vp.vendorId,
          price: Number(vp.price),
          rating: vp.rating,
        })),
      },
    });
    onSuccess();
  };

  const isPending = uploadImage.isPending || approveProduct.isPending;

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>প্রোডাক্ট অনুমোদন করুন</DialogTitle>
          <DialogDescription>
            প্রয়োজনে তথ্য পরিবর্তন করুন এবং এক বা একাধিক ভেন্ডরের দাম/রেটিং দিন। সংরক্ষণের পর প্রোডাক্টটি সব প্রোডাক্ট
            তালিকায় অ্যাক্টিভ হিসেবে দেখাবে।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <BasicInformationSection
            register={register}
            control={control}
            errors={errors}
            categories={categories}
            categoriesLoading={categoriesLoading}
            idPrefix="approve-"
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
            onCancel={() => onOpenChange(false)}
            isPending={isPending}
            savingLabel="অনুমোদন হচ্ছে..."
            saveLabel="অনুমোদন করুন"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

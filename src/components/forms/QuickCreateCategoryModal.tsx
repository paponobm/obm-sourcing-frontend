"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { FormField } from "./FormField";
import { ActionButtons } from "./ActionButtons";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category.schema";
import { useCreateCategory } from "@/hooks/useCategories";
import { useUploadImage } from "@/hooks/useUploadImage";
import { resolveImageValue, type ImageValue } from "@/lib/image-value";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Category } from "@/types/category.types";

/** Lets the admin create a missing category without leaving the Product
 * Create/Edit modal — opens on top of it, and on success hands the new
 * category back to the caller (to auto-select it) instead of navigating
 * anywhere. The product modal underneath is untouched throughout. */
export function QuickCreateCategoryModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (category: Category) => void;
}) {
  const createCategory = useCreateCategory();
  const uploadImage = useUploadImage();
  const [imageValue, setImageValue] = useState<ImageValue>();
  const [imageError, setImageError] = useState<string>();
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  // Fresh form every time this reopens, regardless of how it was closed
  // (Save, Cancel, Escape, or clicking outside).
  useEffect(() => {
    if (!open) {
      reset({ name: "" });
      setImageValue(undefined);
      setImageError(undefined);
      setServerError(undefined);
    }
  }, [open, reset]);

  const onSubmit = async (values: CategoryFormValues) => {
    if (!imageValue) {
      setImageError("ছবি আবশ্যক");
      return;
    }
    setImageError(undefined);
    setServerError(undefined);

    try {
      const imageUrl = await resolveImageValue(imageValue, (file) => uploadImage.mutateAsync(file));
      const category = await createCategory.mutateAsync({ ...values, imageUrl });
      onCreated(category);
      onOpenChange(false);
    } catch (error) {
      setServerError(getApiErrorMessage(error, "ক্যাটাগরি তৈরি করা যায়নি"));
    }
  };

  const isPending = uploadImage.isPending || createCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[60] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন ক্যাটাগরি যোগ করুন</DialogTitle>
          <DialogDescription>প্রোডাক্ট ফর্ম ছেড়ে না গিয়েই নতুন ক্যাটাগরি তৈরি করুন।</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
          <div>
            <Label>ছবি</Label>
            <ImageUploadField
              value={imageValue}
              onChange={(v) => {
                setImageValue(v);
                setImageError(undefined);
              }}
            />
            {imageError && <p className="mt-1 text-[11px] text-red sm:text-xs">{imageError}</p>}
          </div>

          <FormField
            label="ক্যাটাগরির নাম"
            htmlFor="quick-category-name"
            error={errors.name?.message ?? serverError}
          >
            <Input
              id="quick-category-name"
              placeholder="যেমন: শুটকি"
              invalid={Boolean(errors.name || serverError)}
              {...register("name")}
            />
          </FormField>

          <ActionButtons
            onCancel={() => onOpenChange(false)}
            isPending={isPending}
            savingLabel="সংরক্ষণ হচ্ছে..."
            saveLabel="ক্যাটাগরি সংরক্ষণ করুন"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

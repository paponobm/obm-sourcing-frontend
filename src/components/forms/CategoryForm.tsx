"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category.schema";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { useUploadImage } from "@/hooks/useUploadImage";
import { resolveImageValue, type ImageValue } from "@/lib/image-value";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { FormField } from "./FormField";

export function CategoryForm({
  categoryId,
  defaultValues,
  onSuccess,
  onCancel,
}: {
  categoryId?: string;
  defaultValues?: { name: string; imageUrl?: string };
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const uploadImage = useUploadImage();
  const isEditing = Boolean(categoryId);
  const [imageValue, setImageValue] = useState<ImageValue>(defaultValues?.imageUrl);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: defaultValues?.name ?? "" },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    const imageUrl = await resolveImageValue(imageValue, (file) => uploadImage.mutateAsync(file));
    const input = { ...values, imageUrl };
    if (categoryId) {
      updateCategory.mutate({ id: categoryId, input }, { onSuccess });
    } else {
      createCategory.mutate(input, { onSuccess });
    }
  };

  const isPending = uploadImage.isPending || createCategory.isPending || updateCategory.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <div>
        <Label>ছবি (ঐচ্ছিক)</Label>
        <ImageUploadField value={imageValue} onChange={setImageValue} />
      </div>

      <FormField label="ক্যাটাগরির নাম" htmlFor="category-name" error={errors.name?.message}>
        <Input id="category-name" placeholder="যেমন: শুটকি" invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          বাতিল
        </Button>
        <Button type="submit" variant="brass" disabled={isPending}>
          {isPending ? "সংরক্ষণ হচ্ছে..." : isEditing ? "পরিবর্তন সংরক্ষণ করুন" : "ক্যাটাগরি তৈরি করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category.schema";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FormField } from "./FormField";

export function CategoryForm({
  categoryId,
  defaultValues,
  onSuccess,
}: {
  categoryId?: string;
  defaultValues?: { name: string };
  onSuccess: () => void;
}) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEditing = Boolean(categoryId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: defaultValues?.name ?? "" },
  });

  const onSubmit = (values: CategoryFormValues) => {
    if (categoryId) {
      updateCategory.mutate({ id: categoryId, input: values }, { onSuccess });
    } else {
      createCategory.mutate(values, { onSuccess });
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <FormField label="ক্যাটাগরির নাম" htmlFor="category-name" error={errors.name?.message}>
        <Input id="category-name" placeholder="যেমন: শুটকি" invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>

      <DialogFooter>
        <Button type="submit" variant="brass" disabled={isPending}>
          {isPending ? "সংরক্ষণ হচ্ছে..." : isEditing ? "পরিবর্তন সংরক্ষণ করুন" : "ক্যাটাগরি তৈরি করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

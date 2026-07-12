"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FormField } from "./FormField";
import type { Category } from "@/types/category.types";

type BasicFields = { sku: string; name: string; unit: string; categoryId: string; description?: string };

/** SKU/Unit on the left, Name/Category on the right — shared by the create and
 * edit product forms, which both carry these four fields identically. */
export function BasicInformationSection<TFieldValues extends BasicFields>({
  register,
  control,
  errors,
  categories,
  categoriesLoading,
  idPrefix = "",
}: {
  register: UseFormRegister<TFieldValues>;
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  categories?: Category[];
  categoriesLoading: boolean;
  idPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-3.5 gap-y-3 sm:grid-cols-2">
      <FormField label="SKU" htmlFor={`${idPrefix}sku`} error={errors.sku?.message as string | undefined}>
        <Input
          id={`${idPrefix}sku`}
          placeholder="যেমন: SKU-ALF-001"
          invalid={Boolean(errors.sku)}
          {...register("sku" as never)}
        />
      </FormField>
      <FormField label="প্রোডাক্টের নাম" htmlFor={`${idPrefix}name`} error={errors.name?.message as string | undefined}>
        <Input
          id={`${idPrefix}name`}
          placeholder="যেমন: আলফায়ার (শুকনা)"
          invalid={Boolean(errors.name)}
          {...register("name" as never)}
        />
      </FormField>
      <FormField label="ইউনিট" htmlFor={`${idPrefix}unit`} error={errors.unit?.message as string | undefined}>
        <Input
          id={`${idPrefix}unit`}
          placeholder="কেজি / প্যাকেট"
          invalid={Boolean(errors.unit)}
          {...register("unit" as never)}
        />
      </FormField>
      <FormField
        label="ক্যাটাগরি"
        htmlFor={`${idPrefix}categoryId`}
        error={errors.categoryId?.message as string | undefined}
      >
        <Controller
          control={control}
          name={"categoryId" as never}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`${idPrefix}categoryId`}>
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
      <FormField
        label="বিবরণ (ঐচ্ছিক)"
        htmlFor={`${idPrefix}description`}
        error={errors.description?.message as string | undefined}
        full
      >
        <Textarea
          id={`${idPrefix}description`}
          placeholder="প্রোডাক্ট সম্পর্কে অতিরিক্ত তথ্য"
          {...register("description" as never)}
        />
      </FormField>
    </div>
  );
}

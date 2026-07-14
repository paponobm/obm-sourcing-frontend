"use client";

import { useState } from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectCombobox } from "@/components/shared/MultiSelectCombobox";
import { SingleSelectCombobox } from "@/components/shared/SingleSelectCombobox";
import { FormField } from "./FormField";
import { QuickCreateCategoryModal } from "./QuickCreateCategoryModal";
import { QuickCreateUnitModal } from "./QuickCreateUnitModal";
import type { Category } from "@/types/category.types";
import type { Unit } from "@/types/unit.types";

type BasicFields = { sku: string; name: string; unitId: string; categoryIds: string[]; description?: string };

/** SKU/Unit on the left, Name/Category on the right — shared by the create and
 * edit product forms, which both carry these four fields identically. */
export function BasicInformationSection<TFieldValues extends BasicFields>({
  register,
  control,
  errors,
  categories,
  categoriesLoading,
  units,
  unitsLoading,
  idPrefix = "",
}: {
  register: UseFormRegister<TFieldValues>;
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  categories?: Category[];
  categoriesLoading: boolean;
  units?: Unit[];
  unitsLoading: boolean;
  idPrefix?: string;
}) {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateUnitOpen, setQuickCreateUnitOpen] = useState(false);

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
      <FormField label="ইউনিট" htmlFor={`${idPrefix}unitId`} error={errors.unitId?.message as string | undefined}>
        <Controller
          control={control}
          name={"unitId" as never}
          render={({ field }) => (
            <>
              <SingleSelectCombobox
                id={`${idPrefix}unitId`}
                options={units?.map((u) => ({ id: u.id, label: u.name })) ?? []}
                value={field.value ?? ""}
                onChange={field.onChange}
                isLoading={unitsLoading}
                invalid={Boolean(errors.unitId)}
                placeholder="ইউনিট নির্বাচন করুন"
              />
              <button
                type="button"
                onClick={() => setQuickCreateUnitOpen(true)}
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-teal hover:underline sm:text-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                নতুন ইউনিট যোগ করুন
              </button>
              <QuickCreateUnitModal
                open={quickCreateUnitOpen}
                onOpenChange={setQuickCreateUnitOpen}
                onCreated={(unit) => field.onChange(unit.id)}
              />
            </>
          )}
        />
      </FormField>
      <FormField
        label="ক্যাটাগরি"
        htmlFor={`${idPrefix}categoryIds`}
        error={errors.categoryIds?.message as string | undefined}
      >
        <Controller
          control={control}
          name={"categoryIds" as never}
          render={({ field }) => (
            <>
              <MultiSelectCombobox
                id={`${idPrefix}categoryIds`}
                options={categories?.map((c) => ({ id: c.id, label: c.name })) ?? []}
                value={field.value ?? []}
                onChange={field.onChange}
                isLoading={categoriesLoading}
                invalid={Boolean(errors.categoryIds)}
                placeholder="ক্যাটাগরি নির্বাচন করুন"
              />
              <button
                type="button"
                onClick={() => setQuickCreateOpen(true)}
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-teal hover:underline sm:text-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                নতুন ক্যাটাগরি যোগ করুন
              </button>
              <QuickCreateCategoryModal
                open={quickCreateOpen}
                onOpenChange={setQuickCreateOpen}
                onCreated={(category) => field.onChange([...(field.value ?? []), category.id])}
              />
            </>
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

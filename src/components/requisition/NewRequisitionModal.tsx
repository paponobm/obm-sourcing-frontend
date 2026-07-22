"use client";

import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requisitionSchema, type RequisitionFormValues } from "@/lib/validations/requisition.schema";
import { useCreateRequisition, useUpdateRequisition } from "@/hooks/useRequisitions";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RequisitionItemsSection } from "./RequisitionItemsSection";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { REQUISITION_PRIORITY_LABEL_BN } from "@/utils/status";
import type { Requisition } from "@/types/requisition.types";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

function defaultValuesFor(requisition?: Requisition | null): RequisitionFormValues {
  if (requisition) {
    return {
      items: requisition.items.map((i) => ({
        productId: i.productId,
        requiredQty: String(i.requiredQty),
        notes: i.notes ?? "",
      })),
      requiredDate: requisition.requiredDate ?? "",
      priority: requisition.priority,
    };
  }
  return { items: [{ productId: "", requiredQty: "", notes: "" }], requiredDate: "", priority: "MEDIUM" };
}

/** Create mode by default; pass `editingRequisition` to edit a Pending
 * requisition's items/priority/required date in place instead. */
export function NewRequisitionModal({
  open,
  onOpenChange,
  editingRequisition,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRequisition?: Requisition | null;
}) {
  const createRequisition = useCreateRequisition();
  const updateRequisition = useUpdateRequisition();
  const [categoryId, setCategoryId] = useState("");
  const { data: categories } = useCategories();
  const { data: productsPage, isLoading: productsLoading } = useProducts({
    page: 1,
    pageSize: 100,
    categoryId: categoryId || undefined,
  });
  const isEditing = Boolean(editingRequisition);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RequisitionFormValues>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: defaultValuesFor(editingRequisition),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Re-seed the form whenever the modal opens (fresh create, or a possibly
  // different requisition to edit) — react-hook-form's defaultValues are
  // only read once at mount otherwise.
  useEffect(() => {
    if (open) {
      reset(defaultValuesFor(editingRequisition));
      setCategoryId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingRequisition]);

  const watchedItems = watch("items");

  const handleClose = () => {
    reset(defaultValuesFor(null));
    onOpenChange(false);
  };

  const onSubmit = async (values: RequisitionFormValues) => {
    const input = {
      items: values.items.map((i) => ({
        productId: i.productId,
        requiredQty: Number(i.requiredQty),
        notes: i.notes || undefined,
      })),
      requiredDate: values.requiredDate || undefined,
      priority: values.priority,
    };

    if (editingRequisition) {
      await updateRequisition.mutateAsync({ id: editingRequisition.id, input });
    } else {
      await createRequisition.mutateAsync(input);
    }
    handleClose();
  };

  const isPending = createRequisition.isPending || updateRequisition.isPending;
  const hasIncompleteItem = watchedItems.some((i) => !i.productId);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent
        className="sm:max-w-3xl"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "রিকুইজিশন এডিট করুন" : "নতুন রিকুইজিশন"}</DialogTitle>
          <DialogDescription>
            এক বা একাধিক প্রোডাক্ট ও প্রয়োজনীয় পরিমাণ দিয়ে একটি রিকুইজিশন তৈরি করুন — ভেন্ডর নির্বাচন পরে করা যাবে।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField label="ক্যাটাগরি (ঐচ্ছিক)" htmlFor="req-category">
            <Select value={categoryId || "all"} onValueChange={(v) => setCategoryId(v === "all" ? "" : v)}>
              <SelectTrigger id="req-category">
                <SelectValue placeholder="সব ক্যাটাগরি" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <RequisitionItemsSection
            fields={fields}
            control={control}
            register={register}
            watch={watch}
            errors={errors}
            products={productsPage?.data ?? []}
            productsLoading={productsLoading}
            onAppend={() => append({ productId: "", requiredQty: "", notes: "" })}
            onRemove={remove}
          />

          <div className="grid grid-cols-1 gap-x-3.5 gap-y-3 sm:grid-cols-2">
            <FormField label="প্রায়োরিটি" htmlFor="req-priority" error={errors.priority?.message}>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="req-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {REQUISITION_PRIORITY_LABEL_BN[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="প্রয়োজনীয় তারিখ (ঐচ্ছিক)" htmlFor="req-date">
              <Input id="req-date" type="date" {...register("requiredDate")} />
            </FormField>
          </div>

          <ActionButtons
            onCancel={handleClose}
            isPending={isPending}
            disabled={hasIncompleteItem}
            savingLabel="সংরক্ষণ হচ্ছে..."
            saveLabel={isEditing ? "পরিবর্তন সংরক্ষণ করুন" : "রিকুইজিশন তৈরি করুন"}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

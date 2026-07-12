"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requisitionSchema, type RequisitionFormValues } from "@/lib/validations/requisition.schema";
import { useCreateRequisition } from "@/hooks/useRequisitions";
import { useProducts } from "@/hooks/useProducts";
import { useCurrentUser } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { REQUISITION_PRIORITY_LABEL_BN } from "@/utils/status";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function NewRequisitionModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createRequisition = useCreateRequisition();
  const { data: user } = useCurrentUser();
  const { data: productsPage, isLoading: productsLoading } = useProducts({ page: 1, pageSize: 100 });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RequisitionFormValues>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: {
      productId: "",
      requiredQty: "",
      unit: "",
      requiredDate: "",
      notes: "",
      priority: "MEDIUM",
    },
  });

  const selectedProductId = watch("productId");
  const selectedProduct = productsPage?.data.find((p) => p.id === selectedProductId);

  // Selecting a product auto-fills its unit — vendor selection happens later,
  // from the Pending Requisition card, not at requisition-creation time.
  useEffect(() => {
    if (selectedProduct) {
      setValue("unit", selectedProduct.unit);
    }
  }, [selectedProduct, setValue]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (values: RequisitionFormValues) => {
    await createRequisition.mutateAsync({
      productId: values.productId,
      requiredQty: Number(values.requiredQty),
      unit: values.unit,
      requiredDate: values.requiredDate || undefined,
      notes: values.notes || undefined,
      priority: values.priority,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>নতুন রিকুইজিশন</DialogTitle>
          <DialogDescription>প্রোডাক্ট ও প্রয়োজনীয় পরিমাণ দিয়ে একটি রিকুইজিশন তৈরি করুন — ভেন্ডর নির্বাচন পরে করা যাবে।</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-x-3.5 gap-y-3 sm:grid-cols-2">
            <FormField label="প্রোডাক্ট" htmlFor="req-productId" error={errors.productId?.message} full>
              <Controller
                control={control}
                name="productId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="req-productId">
                      <SelectValue placeholder={productsLoading ? "লোড হচ্ছে..." : "প্রোডাক্ট নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {productsPage?.data.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="প্রয়োজনীয় পরিমাণ" htmlFor="req-qty" error={errors.requiredQty?.message}>
              <Input
                id="req-qty"
                type="number"
                min={1}
                placeholder="যেমন: ২৪"
                invalid={Boolean(errors.requiredQty)}
                {...register("requiredQty")}
              />
            </FormField>

            {/* <FormField label="ইউনিট" htmlFor="req-unit" error={errors.unit?.message}>
              <Input id="req-unit" placeholder="কেজি / প্যাকেট" invalid={Boolean(errors.unit)} {...register("unit")} />
            </FormField> */}

            {/* <FormField label="প্রয়োজনীয় তারিখ (ঐচ্ছিক)" htmlFor="req-date">
              <Input id="req-date" type="date" {...register("requiredDate")} />
            </FormField> */}

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

            <div>
              <Label>অনুরোধ করেছেন</Label>
              <div className="flex h-9 items-center text-sm font-semibold text-ink sm:h-10 sm:text-base">
                {user?.name ?? "..."}
              </div>
            </div>

            <FormField label="নোট (ঐচ্ছিক)" htmlFor="req-notes" full>
              <Textarea id="req-notes" placeholder="অতিরিক্ত কোনো তথ্য থাকলে লিখুন" {...register("notes")} />
            </FormField>
          </div>

          <ActionButtons
            onCancel={handleClose}
            isPending={createRequisition.isPending}
            savingLabel="সংরক্ষণ হচ্ছে..."
            saveLabel="রিকুইজিশন তৈরি করুন"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

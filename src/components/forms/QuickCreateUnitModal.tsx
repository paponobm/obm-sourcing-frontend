"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "./FormField";
import { ActionButtons } from "./ActionButtons";
import { unitSchema, type UnitFormValues } from "@/lib/validations/unit.schema";
import { useCreateUnit } from "@/hooks/useUnits";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Unit } from "@/types/unit.types";

/** Lets the admin create a missing unit without leaving the Product
 * Create/Edit modal — opens on top of it, and on success hands the new unit
 * back to the caller (to auto-select it) instead of navigating anywhere.
 * The product modal underneath is untouched throughout. */
export function QuickCreateUnitModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (unit: Unit) => void;
}) {
  const createUnit = useCreateUnit();
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: "" },
  });

  // Fresh form every time this reopens, regardless of how it was closed
  // (Save, Cancel, Escape, or clicking outside).
  useEffect(() => {
    if (!open) {
      reset({ name: "" });
      setServerError(undefined);
    }
  }, [open, reset]);

  const onSubmit = async (values: UnitFormValues) => {
    setServerError(undefined);
    try {
      const unit = await createUnit.mutateAsync(values);
      onCreated(unit);
      onOpenChange(false);
    } catch (error) {
      setServerError(getApiErrorMessage(error, "ইউনিট তৈরি করা যায়নি"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[60] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন ইউনিট যোগ করুন</DialogTitle>
          <DialogDescription>প্রোডাক্ট ফর্ম ছেড়ে না গিয়েই নতুন ইউনিট তৈরি করুন।</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
          <FormField label="ইউনিটের নাম" htmlFor="quick-unit-name" error={errors.name?.message ?? serverError}>
            <Input
              id="quick-unit-name"
              placeholder="যেমন: কেজি"
              invalid={Boolean(errors.name || serverError)}
              {...register("name")}
            />
          </FormField>

          <ActionButtons
            onCancel={() => onOpenChange(false)}
            isPending={createUnit.isPending}
            savingLabel="সংরক্ষণ হচ্ছে..."
            saveLabel="ইউনিট সংরক্ষণ করুন"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unitSchema, type UnitFormValues } from "@/lib/validations/unit.schema";
import { useCreateUnit, useUpdateUnit } from "@/hooks/useUnits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FormField } from "./FormField";

export function UnitForm({
  unitId,
  defaultValues,
  onSuccess,
  onCancel,
}: {
  unitId?: string;
  defaultValues?: { name: string };
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const isEditing = Boolean(unitId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: defaultValues?.name ?? "" },
  });

  const onSubmit = async (values: UnitFormValues) => {
    if (unitId) {
      updateUnit.mutate({ id: unitId, input: values }, { onSuccess });
    } else {
      createUnit.mutate(values, { onSuccess });
    }
  };

  const isPending = createUnit.isPending || updateUnit.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <FormField label="ইউনিটের নাম" htmlFor="unit-name" error={errors.name?.message}>
        <Input id="unit-name" placeholder="যেমন: কেজি" invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          বাতিল
        </Button>
        <Button type="submit" variant="brass" disabled={isPending}>
          {isPending ? "সংরক্ষণ হচ্ছে..." : isEditing ? "পরিবর্তন সংরক্ষণ করুন" : "ইউনিট তৈরি করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

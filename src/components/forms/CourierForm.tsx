"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { courierSchema, type CourierFormValues } from "@/lib/validations/courier.schema";
import { useCreateCourier, useUpdateCourier } from "@/hooks/useCouriers";
import { useUploadImage } from "@/hooks/useUploadImage";
import { resolveImageValue, type ImageValue } from "@/lib/image-value";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { FormField } from "./FormField";

export function CourierForm({
  courierId,
  defaultValues,
  onSuccess,
  onCancel,
}: {
  courierId?: string;
  defaultValues?: {
    name: string;
    primaryMobile: string;
    additionalMobiles?: string[];
    location: string;
    logoUrl?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const createCourier = useCreateCourier();
  const updateCourier = useUpdateCourier();
  const uploadImage = useUploadImage();
  const isEditing = Boolean(courierId);
  const [logoValue, setLogoValue] = useState<ImageValue>(defaultValues?.logoUrl);
  const [additionalMobiles, setAdditionalMobiles] = useState<string[]>(
    defaultValues?.additionalMobiles && defaultValues.additionalMobiles.length > 0
      ? defaultValues.additionalMobiles
      : [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourierFormValues>({
    resolver: zodResolver(courierSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      primaryMobile: defaultValues?.primaryMobile ?? "",
      location: defaultValues?.location ?? "",
    },
  });

  const onSubmit = async (values: CourierFormValues) => {
    const logoUrl = await resolveImageValue(logoValue, (file) => uploadImage.mutateAsync(file));
    const input = {
      ...values,
      logoUrl,
      additionalMobiles: additionalMobiles.map((m) => m.trim()).filter(Boolean),
    };
    if (courierId) {
      updateCourier.mutate({ id: courierId, input }, { onSuccess });
    } else {
      createCourier.mutate(input, { onSuccess });
    }
  };

  const isPending = uploadImage.isPending || createCourier.isPending || updateCourier.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <div>
        <Label>কুরিয়ার লোগো (ঐচ্ছিক)</Label>
        <ImageUploadField value={logoValue} onChange={setLogoValue} />
      </div>

      <FormField label="কুরিয়ার নাম" htmlFor="courier-name" error={errors.name?.message}>
        <Input
          id="courier-name"
          placeholder="যেমন: সুন্দরবন কুরিয়ার"
          invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </FormField>

      <FormField label="প্রাইমারি মোবাইল নম্বর" htmlFor="courier-primary-mobile" error={errors.primaryMobile?.message}>
        <Input
          id="courier-primary-mobile"
          placeholder="যেমন: ০১৭xxxxxxxx"
          invalid={Boolean(errors.primaryMobile)}
          {...register("primaryMobile")}
        />
      </FormField>

      <div>
        <Label>অতিরিক্ত মোবাইল নম্বর (ঐচ্ছিক)</Label>
        <div className="mt-1.5 space-y-2">
          {additionalMobiles.map((mobile, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="যেমন: ০১৮xxxxxxxx"
                value={mobile}
                onChange={(e) => {
                  const next = [...additionalMobiles];
                  next[index] = e.target.value;
                  setAdditionalMobiles(next);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAdditionalMobiles(additionalMobiles.filter((_, i) => i !== index))}
                aria-label="নম্বর সরান"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setAdditionalMobiles([...additionalMobiles, ""])}
        >
          <Plus className="h-3.5 w-3.5" /> আরও নম্বর যোগ করুন
        </Button>
      </div>

      <FormField label="লোকেশন / ঠিকানা" htmlFor="courier-location" error={errors.location?.message}>
        <Input
          id="courier-location"
          placeholder="যেমন: চট্টগ্রাম"
          invalid={Boolean(errors.location)}
          {...register("location")}
        />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          বাতিল
        </Button>
        <Button type="submit" variant="brass" disabled={isPending}>
          {isPending ? "সংরক্ষণ হচ্ছে..." : isEditing ? "পরিবর্তন সংরক্ষণ করুন" : "কুরিয়ার তৈরি করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { vendorSchema, type VendorFormValues } from "@/lib/validations/vendor.schema";
import { useCreateVendor } from "@/hooks/useVendors";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { FormGrid } from "./FormGrid";
import { ROUTES } from "@/constants/routes";

export function VendorForm() {
  const router = useRouter();
  const createVendor = useCreateVendor();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      shopName: "",
      contactPerson: "",
      address: "",
      whatsapp: "",
      phone: "",
      note: "",
    },
  });

  const onSubmit = (values: VendorFormValues) => {
    createVendor.mutate(values, {
      onSuccess: (vendor) => router.push(ROUTES.vendorDetail(vendor.id)),
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormGrid>
          <FormField label="দোকানের নাম" htmlFor="shopName" error={errors.shopName?.message}>
            <Input
              id="shopName"
              placeholder="যেমন: মেঘনা ট্রেডার্স"
              invalid={Boolean(errors.shopName)}
              {...register("shopName")}
            />
          </FormField>
          <FormField
            label="যোগাযোগ ব্যক্তির নাম"
            htmlFor="contactPerson"
            error={errors.contactPerson?.message}
          >
            <Input
              id="contactPerson"
              placeholder="যেমন: মো. কামাল"
              invalid={Boolean(errors.contactPerson)}
              {...register("contactPerson")}
            />
          </FormField>
          <FormField label="ঠিকানা" htmlFor="address" error={errors.address?.message} full>
            <Input
              id="address"
              placeholder="চকবাজার, চট্টগ্রাম"
              invalid={Boolean(errors.address)}
              {...register("address")}
            />
          </FormField>
          <FormField label="হোয়াটসঅ্যাপ নাম্বার" htmlFor="whatsapp" error={errors.whatsapp?.message}>
            <Input
              id="whatsapp"
              placeholder="01XXXXXXXXX"
              invalid={Boolean(errors.whatsapp)}
              {...register("whatsapp")}
            />
          </FormField>
          <FormField label="ফোন নাম্বার" htmlFor="phone" error={errors.phone?.message}>
            <Input
              id="phone"
              placeholder="01XXXXXXXXX"
              invalid={Boolean(errors.phone)}
              {...register("phone")}
            />
          </FormField>
          <FormField label="নোট / মন্তব্য (ঐচ্ছিক)" htmlFor="note" full>
            <Textarea
              id="note"
              placeholder="যেমন: শুক্রবার বন্ধ থাকে, অগ্রিম পেমেন্ট লাগে"
              {...register("note")}
            />
          </FormField>
        </FormGrid>
        <div className="flex gap-2.5 px-[18px] pb-[18px]">
          <Button type="submit" variant="brass" disabled={createVendor.isPending}>
            {createVendor.isPending ? "সংরক্ষণ হচ্ছে..." : "ভেন্ডর সংরক্ষণ করুন"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push(ROUTES.vendors)}>
            বাতিল
          </Button>
        </div>
      </form>
    </Card>
  );
}

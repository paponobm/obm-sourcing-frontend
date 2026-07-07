"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { productSchema, type ProductFormValues } from "@/lib/validations/product.schema";
import { useCreateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useVendors, useSetVendorProductPrice } from "@/hooks/useVendors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { StarRating } from "@/components/product/StarRating";
import { FormField } from "./FormField";

export function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const createProduct = useCreateProduct();
  const setVendorProductPrice = useSetVendorProductPrice();
  const { data: vendorsPage, isLoading: vendorsLoading } = useVendors({ page: 1, pageSize: 100 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      unit: "",
      categoryId: "",
      vendorPrices: [{ vendorId: "", price: "", rating: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "vendorPrices" });
  const watchedVendorPrices = watch("vendorPrices");

  const onSubmit = async (values: ProductFormValues) => {
    const product = await createProduct.mutateAsync({
      sku: values.sku,
      name: values.name,
      unit: values.unit,
      categoryId: values.categoryId,
    });

    await Promise.all(
      values.vendorPrices.map((vp) =>
        setVendorProductPrice.mutateAsync({
          vendorId: vp.vendorId,
          productId: product.id,
          price: Number(vp.price),
          rating: vp.rating,
        }),
      ),
    );

    onSuccess();
  };

  const isPending = createProduct.isPending || setVendorProductPrice.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <FormField label="SKU" htmlFor="sku" error={errors.sku?.message}>
        <Input id="sku" placeholder="যেমন: SKU-ALF-001" invalid={Boolean(errors.sku)} {...register("sku")} />
      </FormField>
      <FormField label="প্রোডাক্টের নাম" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="যেমন: আলফায়ার (শুকনা)" invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>
      <FormField label="ইউনিট" htmlFor="unit" error={errors.unit?.message}>
        <Input id="unit" placeholder="কেজি / প্যাকেট" invalid={Boolean(errors.unit)} {...register("unit")} />
      </FormField>
      <FormField label="ক্যাটাগরি" htmlFor="categoryId" error={errors.categoryId?.message}>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="categoryId">
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

      <div>
        <Label>ভেন্ডর ও দাম</Label>
        {errors.vendorPrices?.message && (
          <p className="mb-1.5 text-xs text-red">{errors.vendorPrices.message}</p>
        )}
        <div className="space-y-2.5">
          {fields.map((field, index) => {
            const selectedElsewhere = watchedVendorPrices
              .filter((_, i) => i !== index)
              .map((vp) => vp.vendorId);

            return (
              <div key={field.id} className="rounded border border-line p-2.5">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Controller
                      control={control}
                      name={`vendorPrices.${index}.vendorId`}
                      render={({ field: vendorField }) => (
                        <Select value={vendorField.value} onValueChange={vendorField.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={vendorsLoading ? "লোড হচ্ছে..." : "ভেন্ডর নির্বাচন করুন"} />
                          </SelectTrigger>
                          <SelectContent>
                            {vendorsPage?.data
                              .filter((v) => !selectedElsewhere.includes(v.id))
                              .map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.shopName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.vendorPrices?.[index]?.vendorId && (
                      <p className="text-xs text-red">{errors.vendorPrices[index]?.vendorId?.message}</p>
                    )}

                    <Input
                      type="number"
                      min={0}
                      placeholder="দাম (৳)"
                      invalid={Boolean(errors.vendorPrices?.[index]?.price)}
                      {...register(`vendorPrices.${index}.price`)}
                    />
                    {errors.vendorPrices?.[index]?.price && (
                      <p className="text-xs text-red">{errors.vendorPrices[index]?.price?.message}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray">রেটিং:</span>
                      <Controller
                        control={control}
                        name={`vendorPrices.${index}.rating`}
                        render={({ field: ratingField }) => (
                          <StarRating value={ratingField.value} onChange={ratingField.onChange} size={16} />
                        )}
                      />
                    </div>
                    {errors.vendorPrices?.[index]?.rating && (
                      <p className="text-xs text-red">{errors.vendorPrices[index]?.rating?.message}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => append({ vendorId: "", price: "", rating: 0 })}
        >
          <Plus className="h-3.5 w-3.5" /> আরেকটি ভেন্ডর যোগ করুন
        </Button>
      </div>

      <DialogFooter>
        <Button type="submit" variant="brass" disabled={isPending}>
          {isPending ? "সংরক্ষণ হচ্ছে..." : "প্রোডাক্ট সংরক্ষণ করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

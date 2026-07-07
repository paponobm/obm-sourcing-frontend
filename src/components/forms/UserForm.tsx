"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserFormValues } from "@/lib/validations/user.schema";
import { useCreateUser } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { ROLE_LABEL_BN } from "@/constants/roles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FormField } from "./FormField";

export function UserForm({ onSuccess }: { onSuccess: () => void }) {
  const createUser = useCreateUser();
  const { data: roles, isLoading: rolesLoading } = useRoles();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", phone: "", email: "", password: "", role: "VIEWER" },
  });

  const onSubmit = (values: CreateUserFormValues) => {
    createUser.mutate(
      { ...values, email: values.email || undefined },
      { onSuccess },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
      <FormField label="নাম" htmlFor="user-name" error={errors.name?.message}>
        <Input id="user-name" invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>
      <FormField label="ফোন নাম্বার" htmlFor="user-phone" error={errors.phone?.message}>
        <Input id="user-phone" placeholder="01XXXXXXXXX" invalid={Boolean(errors.phone)} {...register("phone")} />
      </FormField>
      <FormField label="ইমেইল (ঐচ্ছিক)" htmlFor="user-email" error={errors.email?.message}>
        <Input id="user-email" type="email" placeholder="you@example.com" {...register("email")} />
      </FormField>
      <FormField label="পাসওয়ার্ড" htmlFor="user-password" error={errors.password?.message}>
        <Input id="user-password" type="password" invalid={Boolean(errors.password)} {...register("password")} />
      </FormField>
      <FormField label="রোল" htmlFor="user-role" error={errors.role?.message}>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="user-role">
                <SelectValue placeholder={rolesLoading ? "লোড হচ্ছে..." : "রোল নির্বাচন করুন"} />
              </SelectTrigger>
              <SelectContent>
                {(roles ?? []).map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    {ROLE_LABEL_BN[r.name]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <DialogFooter>
        <Button type="submit" variant="brass" disabled={createUser.isPending}>
          {createUser.isPending ? "তৈরি হচ্ছে..." : "ইউজার তৈরি করুন"}
        </Button>
      </DialogFooter>
    </form>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth.schema";
import { useLogin } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => login.mutate(values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-[14px]">
        <Label htmlFor="identifier">ফোন নাম্বার বা ইমেইল</Label>
        <Input
          id="identifier"
          placeholder="01XXXXXXXXX"
          invalid={Boolean(errors.identifier)}
          {...register("identifier")}
        />
        {errors.identifier && (
          <p className="mt-1 text-xs text-red">{errors.identifier.message}</p>
        )}
      </div>

      <div className="mb-[14px]">
        <Label htmlFor="password">পাসওয়ার্ড</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••••"
          invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && <p className="mt-1 text-xs text-red">{errors.password.message}</p>}
      </div>

      <Button type="submit" fullWidth className="mt-1.5" disabled={login.isPending}>
        {login.isPending ? "সাইন ইন হচ্ছে..." : "সাইন ইন করুন"}
      </Button>
    </form>
  );
}

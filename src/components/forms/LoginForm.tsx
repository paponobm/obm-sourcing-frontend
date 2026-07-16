"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, otpSchema, type LoginFormValues, type OtpFormValues } from "@/lib/validations/auth.schema";
import { useLogin, useVerifyOtp } from "@/hooks/useAuth";
import { getOrCreateDeviceId } from "@/lib/device-id";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const login = useLogin();
  const verifyOtp = useVerifyOtp();
  const [showPassword, setShowPassword] = useState(false);
  const [otpChallenge, setOtpChallenge] = useState<{ challengeId: string; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    const deviceId = getOrCreateDeviceId();
    login.mutate(
      { ...values, deviceId },
      {
        onSuccess: (result) => {
          if (result.otpRequired) {
            setOtpChallenge({ challengeId: result.challengeId, message: result.message });
          }
        },
      },
    );
  };

  const onSubmitOtp = (values: OtpFormValues) => {
    if (!otpChallenge) return;
    const deviceId = getOrCreateDeviceId();
    verifyOtp.mutate({ challengeId: otpChallenge.challengeId, code: values.code, deviceId });
  };

  if (otpChallenge) {
    return (
      <form onSubmit={handleOtpSubmit(onSubmitOtp)} noValidate>
        <div className="mb-[14px] rounded border border-[#E7D4A8] bg-brass-soft px-[11px] py-[9px] text-[0.71875rem] leading-[1.5] text-gray">
          {otpChallenge.message}
        </div>
        <div className="mb-[14px]">
          <Label htmlFor="code">৬ সংখ্যার যাচাইকরণ কোড</Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            placeholder="______"
            className="tracking-[0.5em]"
            invalid={Boolean(otpErrors.code)}
            {...registerOtp("code")}
          />
          {otpErrors.code && <p className="mt-1 text-xs text-red">{otpErrors.code.message}</p>}
        </div>

        <Button type="submit" fullWidth className="mt-1.5" disabled={verifyOtp.isPending}>
          {verifyOtp.isPending ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
        </Button>
        <button
          type="button"
          onClick={() => setOtpChallenge(null)}
          className="mt-3 w-full text-center text-xs text-gray underline"
        >
          ফিরে যান
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-[14px]">
        <Label htmlFor="identifier">ইমেইল বা ফোন নাম্বার</Label>
        <Input
          id="identifier"
          placeholder="you@example.com"
          invalid={Boolean(errors.identifier)}
          {...register("identifier")}
        />
        {errors.identifier && (
          <p className="mt-1 text-xs text-red">{errors.identifier.message}</p>
        )}
      </div>

      <div className="mb-[14px]">
        <Label htmlFor="password">পাসওয়ার্ড</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••"
            invalid={Boolean(errors.password)}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-ink"
            aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red">{errors.password.message}</p>}
      </div>

      {login.isPending && login.failureCount > 0 && (
        <p className="mb-2 text-center text-xs text-brass">
          সার্ভার প্রস্তুত হচ্ছে... আবার চেষ্টা করা হচ্ছে ({login.failureCount}/5)
        </p>
      )}

      <Button type="submit" fullWidth className="mt-1.5" disabled={login.isPending}>
        {login.isPending
          ? login.failureCount > 0
            ? "অপেক্ষা করুন..."
            : "সাইন ইন হচ্ছে..."
          : "সাইন ইন করুন"}
      </Button>
    </form>
  );
}

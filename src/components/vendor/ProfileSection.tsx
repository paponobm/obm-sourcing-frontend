"use client";

import { ProfileCard } from "@/components/vendor/ProfileCard";
import { VendorProfileDashboard } from "@/components/vendor/VendorProfileDashboard";
import type { VendorWithProducts } from "@/types/vendor.types";

export function ProfileSection({ vendor }: { vendor: VendorWithProducts }) {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:gap-[18px]">
      <div className="w-full lg:w-[270px] lg:shrink-0 xl:w-[300px]">
        <ProfileCard vendor={vendor} />
      </div>
      <div className="flex-1">
        <VendorProfileDashboard vendor={vendor} />
      </div>
    </div>
  );
}

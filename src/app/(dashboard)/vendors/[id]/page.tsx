"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProfileCard } from "@/components/vendor/ProfileCard";
import { VendorProductsTable } from "@/components/vendor/VendorProductsTable";
import { useVendor } from "@/hooks/useVendor";
import { ROUTES } from "@/constants/routes";

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vendor, isLoading } = useVendor(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-[18px] lg:flex-row">
        <Skeleton className="h-64 w-full lg:w-[270px] lg:shrink-0" />
        <Skeleton className="h-64 flex-1" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <EmptyState
        title="ভেন্ডর পাওয়া যায়নি"
        description="এই ভেন্ডরটি হয়তো মুছে ফেলা হয়েছে বা লিংকটি ভুল।"
        action={
          <Button asChild variant="ghost" className="mt-2">
            <Link href={ROUTES.vendors}>ভেন্ডর তালিকায় ফিরে যান</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: "ভেন্ডর তালিকা", href: ROUTES.vendors }, { label: vendor.shopName }]} />
      <Topbar
        title={vendor.shopName}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost">এডিট</Button>
            <Button variant="brass">
              <Plus className="h-4 w-4" /> প্রোডাক্ট যোগ করুন
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-[18px] lg:flex-row">
        <div className="w-full lg:w-[270px] lg:shrink-0">
          <ProfileCard vendor={vendor} />
        </div>
        <div className="flex-1">
          <VendorProductsTable products={vendor.products} totalCount={vendor.productCount} />
        </div>
      </div>
    </>
  );
}

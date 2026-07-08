"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { SearchBox } from "@/components/shared/SearchBox";
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
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    if (!vendor) return [];
    const term = search.trim().toLowerCase();
    if (!term) return vendor.products;
    return vendor.products.filter((p) => p.productName.toLowerCase().includes(term));
  }, [vendor, search]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:gap-[18px]">
        <Skeleton className="h-56 w-full sm:h-60 lg:h-64 lg:w-[270px] lg:shrink-0" />
        <Skeleton className="h-56 flex-1 sm:h-60 lg:h-64" />
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
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="প্রোডাক্ট সার্চ করুন..."
          />
        }
      />

      <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:gap-[18px]">
        <div className="w-full lg:w-[270px] lg:shrink-0 xl:w-[300px]">
          <ProfileCard vendor={vendor} />
        </div>
        <div className="flex-1">
          <VendorProductsTable
            vendorId={vendor.id}
            products={filteredProducts}
            totalCount={vendor.productCount}
          />
        </div>
      </div>
    </>
  );
}

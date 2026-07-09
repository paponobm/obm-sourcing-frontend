"use client";

import { useMemo, useState } from "react";
import { SearchBox } from "@/components/shared/SearchBox";
import { ProfileCard } from "@/components/vendor/ProfileCard";
import { VendorProductsTable } from "@/components/vendor/VendorProductsTable";
import type { VendorWithProducts } from "@/types/vendor.types";

export function ProfileSection({ vendor }: { vendor: VendorWithProducts }) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vendor.products;
    return vendor.products.filter((p) => p.productName.toLowerCase().includes(term));
  }, [vendor, search]);

  return (
    <>
      <div className="mb-3.5 flex justify-end sm:mb-4">
        <SearchBox value={search} onChange={setSearch} placeholder="প্রোডাক্ট সার্চ করুন..." />
      </div>
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

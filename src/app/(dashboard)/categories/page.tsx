"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategorySectionTabs, type CategorySectionKey } from "@/components/product/CategorySectionTabs";
import { CategorySection } from "@/components/product/CategorySection";
import { UnitSection } from "@/components/product/UnitSection";
import { CourierSection } from "@/components/courier/CourierSection";

const VALID_SECTIONS: CategorySectionKey[] = ["category", "unit", "courier"];

// useSearchParams() (used below to read the active tab) requires a Suspense
// boundary so this statically prerenderable route can still build.
export default function CategoriesPage() {
  return (
    <Suspense>
      <CategoriesPageContent />
    </Suspense>
  );
}

function CategoriesPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Same URL-synced-tabs fix as /products and the Vendor workspace — read
  // the active tab from the URL every render so refresh preserves it, and
  // push a real history entry per tab switch so Back steps through tabs
  // instead of skipping past all of them.
  const tabParam = searchParams.get("tab");
  const activeSection: CategorySectionKey = VALID_SECTIONS.includes(tabParam as CategorySectionKey)
    ? (tabParam as CategorySectionKey)
    : "category";

  const handleChange = (section: CategorySectionKey) => {
    router.push(`${pathname}?tab=${section}`);
  };

  return (
    <>
      <CategorySectionTabs active={activeSection} onChange={handleChange} />
      {activeSection === "category" && <CategorySection />}
      {activeSection === "unit" && <UnitSection />}
      {activeSection === "courier" && <CourierSection />}
    </>
  );
}

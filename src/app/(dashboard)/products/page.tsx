"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductSectionTabs, type ProductSectionKey } from "@/components/product/ProductSectionTabs";
import { AllProductsSection } from "@/components/product/AllProductsSection";
import { PendingProductsSection } from "@/components/product/PendingProductsSection";

const VALID_SECTIONS: ProductSectionKey[] = ["all", "pending"];

export default function ProductsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read straight from the URL (not a useState snapshot) so a refresh always
  // lands back on whichever tab is actually showing, and every tab switch
  // below pushes a real history entry instead of only mutating local state —
  // otherwise browser Back skips past both tabs straight to whatever page
  // preceded /products.
  const tabParam = searchParams.get("tab");
  const activeSection: ProductSectionKey = VALID_SECTIONS.includes(tabParam as ProductSectionKey)
    ? (tabParam as ProductSectionKey)
    : "all";

  const handleChange = (section: ProductSectionKey) => {
    router.push(`${pathname}?tab=${section}`);
  };

  return (
    <>
      <ProductSectionTabs active={activeSection} onChange={handleChange} />
      {activeSection === "all" && <AllProductsSection />}
      {activeSection === "pending" && <PendingProductsSection />}
    </>
  );
}

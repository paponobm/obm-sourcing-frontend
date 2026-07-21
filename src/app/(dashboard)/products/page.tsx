"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductSectionTabs, type ProductSectionKey } from "@/components/product/ProductSectionTabs";
import { AllProductsSection } from "@/components/product/AllProductsSection";
import { PendingProductsSection } from "@/components/product/PendingProductsSection";
import { useHasRole } from "@/hooks/useHasRole";

const VALID_SECTIONS: ProductSectionKey[] = ["all", "pending", "mine"];

// useSearchParams() (used below to read the active tab) requires a Suspense
// boundary so this statically prerenderable route can still build.
export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isManager = useHasRole(["MANAGER"]);

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

  // Manager sees the same Admin-approved catalog everyone does on "সব
  // প্রোডাক্ট" — "নিজের প্রোডাক্ট" is the one scoped to just their own
  // submissions (any status). No approval-queue tab for them.
  if (isManager) {
    return (
      <>
        <ProductSectionTabs active={activeSection} onChange={handleChange} />
        {activeSection === "mine" ? <AllProductsSection scopeToOwn /> : <AllProductsSection />}
      </>
    );
  }

  return (
    <>
      <ProductSectionTabs active={activeSection} onChange={handleChange} />
      {activeSection === "all" && <AllProductsSection />}
      {activeSection === "pending" && <PendingProductsSection />}
    </>
  );
}

"use client";

import { useState } from "react";
import { ProductSectionTabs, type ProductSectionKey } from "@/components/product/ProductSectionTabs";
import { AllProductsSection } from "@/components/product/AllProductsSection";
import { PendingProductsSection } from "@/components/product/PendingProductsSection";

export default function ProductsPage() {
  const [activeSection, setActiveSection] = useState<ProductSectionKey>("all");

  return (
    <>
      <ProductSectionTabs active={activeSection} onChange={setActiveSection} />
      {activeSection === "all" && <AllProductsSection />}
      {activeSection === "pending" && <PendingProductsSection />}
    </>
  );
}

"use client";

import { useState } from "react";
import { CategorySectionTabs, type CategorySectionKey } from "@/components/product/CategorySectionTabs";
import { CategorySection } from "@/components/product/CategorySection";
import { UnitSection } from "@/components/product/UnitSection";
import { CourierSection } from "@/components/courier/CourierSection";

export default function CategoriesPage() {
  const [activeSection, setActiveSection] = useState<CategorySectionKey>("category");

  return (
    <>
      <CategorySectionTabs active={activeSection} onChange={setActiveSection} />
      {activeSection === "category" && <CategorySection />}
      {activeSection === "unit" && <UnitSection />}
      {activeSection === "courier" && <CourierSection />}
    </>
  );
}

"use client";

import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PriceCompareTable } from "@/components/product/PriceCompareTable";
import { usePriceComparison } from "@/hooks/usePriceComparison";
import { ROUTES } from "@/constants/routes";

export default function PriceComparePage() {
  const { id } = useParams<{ id: string }>();
  const { data: comparison, isLoading } = usePriceComparison(id);

  if (isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (!comparison) {
    return (
      <EmptyState
        title="দামের তুলনা পাওয়া যায়নি"
        description="এই প্রোডাক্টের জন্য এখনো কোনো ভেন্ডরের দাম যোগ করা হয়নি।"
      />
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: "প্রোডাক্ট তালিকা", href: ROUTES.products }, { label: comparison.productName }]} />
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 font-serif text-[1.1875rem] text-teal-dark">
          {comparison.productName} — প্রাইস কম্পেয়ার
        </h2>
        <span className="text-xs text-gray">
          {comparison.rows.length} জন ভেন্ডর সরবরাহ করছেন · দাম অনুযায়ী সাজানো (কম → বেশি)
        </span>
      </div>

      <PriceCompareTable rows={comparison.rows} />

      <p className="mt-2.5 text-center text-xs text-gray">
        💡 কোনো ভেন্ডরের দাম আপডেট হলে এই তালিকা নিজে থেকেই নতুন করে সাজবে — সবচেয়ে কম দাম সবসময় উপরে থাকবে।
      </p>
    </>
  );
}

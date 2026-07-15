// "use client";

// import { useState } from "react";
// import { Topbar } from "@/components/layout/Topbar";
// import { SearchBox } from "@/components/shared/SearchBox";
// import { EmptyState } from "@/components/shared/EmptyState";
// import { Skeleton } from "@/components/ui/skeleton";
// import { PriceCompareTable } from "@/components/product/PriceCompareTable";
// import { useProducts } from "@/hooks/useProducts";
// import { useDebounce } from "@/hooks/use-debounce";

// const ALL_PRODUCTS_PAGE_SIZE = 500;

// export default function ProductsCompareAllPage() {
//   const [search, setSearch] = useState("");
//   const debouncedSearch = useDebounce(search);

//   const { data, isLoading } = useProducts({
//     page: 1,
//     pageSize: ALL_PRODUCTS_PAGE_SIZE,
//     search: debouncedSearch,
//   });

//   const comparableProducts = (data?.data ?? []).filter((p) => p.vendors.length > 0);

//   return (
//     <>
//       <Topbar
//         title="প্রাইস কম্পেয়ার — সব প্রোডাক্ট"
//         actions={<SearchBox value={search} onChange={setSearch} placeholder="প্রোডাক্ট বা SKU সার্চ করুন..." />}
//       />

//       {isLoading && (
//         <div className="space-y-4">
//           <Skeleton className="h-40 w-full" />
//           <Skeleton className="h-40 w-full" />
//         </div>
//       )}

//       {!isLoading && comparableProducts.length === 0 && (
//         <EmptyState
//           title="কম্পেয়ার করার মতো কিছু নেই"
//           description="কোনো প্রোডাক্টের জন্য এখনো কোনো ভেন্ডরের দাম যোগ করা হয়নি।"
//         />
//       )}

//       {!isLoading && comparableProducts.length > 0 && (
//         <div className="space-y-4">
//           {comparableProducts.map((product) => (
//             <PriceCompareTable key={product.id} productName={product.name} rows={product.vendors} />
//           ))}
//         </div>
//       )}
//     </>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Scale } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/shared/SearchBox";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/forms/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/use-debounce";
import { ROUTES } from "@/constants/routes";
import { formatBDT } from "@/utils/currency";
import type { Product } from "@/types/product.types";
import type { ProductSortColumn } from "@/services/product.service";
import type { SortDirection } from "@/types/common.types";

const PAGE_SIZE = 10;

export default function ProductListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<ProductSortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    sortColumn,
    sortDirection,
  });

  const handleSortChange = (column: string) => {
    const col = column as ProductSortColumn;
    if (col === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const columns: DataTableColumn<Product>[] = [
    { key: "name", header: "প্রোডাক্টের নাম", sortable: true, render: (p) => p.name },
    { key: "unit", header: "ইউনিট", render: (p) => p.unit },
    { key: "category", header: "ক্যাটাগরি", render: (p) => p.category ?? "—" },
    {
      key: "vendorCount",
      header: "ভেন্ডর সংখ্যা",
      sortable: true,
      render: (p) => `${p.vendorCount} জন`,
    },
    {
      key: "lowestPrice",
      header: "সর্বনিম্ন দাম",
      sortable: true,
      render: (p) => (
        <span className="font-mono font-bold text-brass">{formatBDT(p.lowestPrice)}</span>
      ),
    },
    {
      key: "compare",
      header: "",
      render: (p) => (
        <Link
          href={ROUTES.priceCompare(p.id)}
          className="inline-flex items-center gap-1 text-xs text-teal hover:underline"
        >
          <Scale className="h-3.5 w-3.5" /> কম্পেয়ার
        </Link>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title={`প্রোডাক্ট তালিকা (${data?.total ?? "..."})`}
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="প্রোডাক্ট সার্চ করুন..."
            />
            <Button variant="brass" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> নতুন প্রোডাক্ট
            </Button>
          </div>
        }
      />

      <Card>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          rowKey={(p) => p.id}
          isLoading={isLoading}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          emptyTitle="কোনো প্রোডাক্ট পাওয়া যায়নি"
          emptyDescription="অন্য কিছু সার্চ করুন অথবা নতুন প্রোডাক্ট যোগ করুন।"
        />
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নতুন প্রোডাক্ট যোগ করুন</DialogTitle>
            <DialogDescription>প্রোডাক্টের নাম, ইউনিট ও ক্যাটাগরি দিন।</DialogDescription>
          </DialogHeader>
          <ProductForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

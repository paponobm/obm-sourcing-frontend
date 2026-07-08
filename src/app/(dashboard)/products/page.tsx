"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/shared/SearchBox";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Avatar } from "@/components/shared/Avatar";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/forms/ProductForm";
import { ProductDetailsEditForm } from "@/components/forms/ProductDetailsEditForm";
import { ProductVendorPicker } from "@/components/product/ProductVendorPicker";
import { CategoryStrip } from "@/components/product/CategoryStrip";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/use-debounce";
import { useHasRole } from "@/hooks/useHasRole";
import { MANAGE_CATALOG_ROLES, SUPER_ADMIN_ONLY } from "@/constants/roles";
import type { Product } from "@/types/product.types";
import type { ProductSortColumn } from "@/services/product.service";
import type { SortDirection } from "@/types/common.types";

const PAGE_SIZE = 10;

export default function ProductListPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<ProductSortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);
  const canManage = useHasRole(MANAGE_CATALOG_ROLES);
  const canDelete = useHasRole(SUPER_ADMIN_ONLY);
  const deleteProduct = useDeleteProduct();
  const { data: categories } = useCategories();

  const { data, isLoading } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    categoryId: categoryId || undefined,
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

  const editingProduct = data?.data.find((p) => p.id === editingId);

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      header: "প্রোডাক্টের নাম",
      sortable: true,
      render: (p) => (
        <span className="flex items-center">
          <Avatar initials={p.name.slice(0, 2)} imageUrl={p.thumbnailUrl} />
          {p.name}
        </span>
      ),
    },
    { key: "sku", header: "SKU", render: (p) => <span className="font-mono text-xs">{p.sku}</span> },
    { key: "unit", header: "ইউনিট", render: (p) => p.unit },
    { key: "category", header: "ক্যাটাগরি", render: (p) => p.categoryName },
    {
      key: "vendorCount",
      header: "ভেন্ডর সংখ্যা",
      sortable: true,
      render: (p) => `${p.vendorCount} জন`,
    },
    {
      key: "vendors",
      header: "ভেন্ডর ও দাম",
      render: (p) => <ProductVendorPicker vendors={p.vendors} />,
    },
    ...(canManage || canDelete
      ? [
          {
            key: "actions",
            header: "",
            render: (p: Product) => (
              <div className="flex justify-end gap-1.5">
                {canManage && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(p.id)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canDelete && (
                  <ConfirmDialog
                    trigger={
                      <Button type="button" variant="ghost" size="sm">
                        <Trash2 className="h-3.5 w-3.5 text-red" />
                      </Button>
                    }
                    title="প্রোডাক্ট মুছে ফেলবেন?"
                    description={`"${p.name}" সম্পূর্ণরূপে মুছে ফেলা হবে — এটি সব ভেন্ডরের তালিকা থেকেও বাদ যাবে। এই কাজটি ফিরিয়ে আনা যাবে না।`}
                    confirmLabel="মুছে ফেলুন"
                    onConfirm={() => deleteProduct.mutate(p.id)}
                    isLoading={deleteProduct.isPending}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
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
              placeholder="প্রোডাক্ট বা SKU সার্চ করুন..."
            />
            {canManage && (
              <Button variant="brass" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> নতুন প্রোডাক্ট
              </Button>
            )}
          </div>
        }
      />

      <CategoryStrip
        categories={categories ?? []}
        selectedId={categoryId}
        onSelect={(id) => {
          setCategoryId(id);
          setPage(1);
        }}
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
            <DialogDescription>SKU, নাম, ইউনিট, ক্যাটাগরি ও এক বা একাধিক ভেন্ডরের দাম/রেটিং দিন।</DialogDescription>
          </DialogHeader>
          <ProductForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>প্রোডাক্ট এডিট করুন</DialogTitle>
            <DialogDescription>
              এই পরিবর্তন সব ভেন্ডরের জন্য প্রযোজ্য হবে। ভেন্ডর-ভিত্তিক দাম/রেটিং এডিট করতে সেই ভেন্ডরের পাতায় যান।
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductDetailsEditForm
              productId={editingProduct.id}
              defaultValues={{
                sku: editingProduct.sku,
                name: editingProduct.name,
                unit: editingProduct.unit,
                categoryId: editingProduct.categoryId,
                thumbnailUrl: editingProduct.thumbnailUrl,
                imageUrls: editingProduct.imageUrls,
              }}
              onSuccess={() => setEditingId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

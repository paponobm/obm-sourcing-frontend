"use client";

import { useState } from "react";
import { Plus, Pencil, Ban, CheckCircle2, History } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
import { ProductActivityLogModal } from "@/components/product/ProductActivityLogModal";
import { ProductSearchBar } from "@/components/product/ProductSearchBar";
import { CategoryStrip } from "@/components/product/CategoryStrip";
import { useProducts, useActivateProduct, useDeactivateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useHasRole } from "@/hooks/useHasRole";
import { MANAGE_CATALOG_ROLES } from "@/constants/roles";
import { PRODUCT_STATUS_LABEL_BN, productStatusBadgeVariant } from "@/utils/status";
import type { Product } from "@/types/product.types";
import type { ProductSortColumn } from "@/services/product.service";
import type { SortDirection } from "@/types/common.types";

const PAGE_SIZE = 10;

export function AllProductsSection() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<ProductSortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const canManage = useHasRole(MANAGE_CATALOG_ROLES);
  const activateProduct = useActivateProduct();
  const deactivateProduct = useDeactivateProduct();
  const { data: categories } = useCategories();

  const { data, isLoading } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    search,
    statusFilter,
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
  const historyProduct = data?.data.find((p) => p.id === historyId);

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      header: "প্রোডাক্টের নাম",
      sortable: true,
      render: (p) => (
        <span className="flex items-center text-sm md:text-base lg:text-lg xl:text-xl">
          <Avatar initials={p.name.slice(0, 2)} imageUrl={p.thumbnailUrl} />
          {p.name}
        </span>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      render: (p) => <span className="font-mono text-[11px] sm:text-xs lg:text-sm">{p.sku}</span>,
    },
    { key: "unit", header: "ইউনিট", render: (p) => p.unit },
    { key: "category", header: "ক্যাটাগরি", render: (p) => p.categories.map((c) => c.name).join(", ") },
    {
      key: "vendorCount",
      header: "ভেন্ডর সংখ্যা",
      sortable: true,
      render: (p) => `${p.vendorCount} জন`,
    },
    {
      key: "vendors",
      header: "ভেন্ডর ও দাম",
      render: (p) => (
        <ProductVendorPicker productId={p.id} preferredVendorId={p.preferredVendorId} vendors={p.vendors} />
      ),
    },
    {
      key: "status",
      header: "স্ট্যাটাস",
      render: (p) => <Badge variant={productStatusBadgeVariant(p.status)}>{PRODUCT_STATUS_LABEL_BN[p.status]}</Badge>,
    },
    {
      key: "actions",
      header: "",
      render: (p: Product) => (
        <div className="flex justify-end gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={() => setHistoryId(p.id)}>
            <History className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
          </Button>
          {canManage && (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(p.id)}>
                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
              </Button>
              {p.status === "ACTIVE" ? (
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="ghost" size="sm">
                      <Ban className="h-3 w-3 text-red sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                    </Button>
                  }
                  title="প্রোডাক্টটি নিষ্ক্রিয় করবেন?"
                  description={`আপনি কি নিশ্চিত "${p.name}" নিষ্ক্রিয় করতে চান?`}
                  confirmLabel="নিষ্ক্রিয় করুন"
                  onConfirm={() => deactivateProduct.mutate(p.id)}
                  isLoading={deactivateProduct.isPending}
                />
              ) : (
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="ghost" size="sm">
                      <CheckCircle2 className="h-3 w-3 text-teal sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                    </Button>
                  }
                  title="প্রোডাক্টটি সক্রিয় করবেন?"
                  description={`আপনি কি নিশ্চিত "${p.name}" সক্রিয় করতে চান?`}
                  confirmLabel="সক্রিয় করুন"
                  onConfirm={() => activateProduct.mutate(p.id)}
                  isLoading={activateProduct.isPending}
                />
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title={`প্রোডাক্ট তালিকা (${data?.total ?? "..."})`}
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ProductSearchBar
              onSearch={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as "active" | "inactive" | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">অ্যাক্টিভ প্রোডাক্ট</SelectItem>
                <SelectItem value="inactive">ইনঅ্যাক্টিভ প্রোডাক্ট</SelectItem>
                <SelectItem value="all">সব প্রোডাক্ট</SelectItem>
              </SelectContent>
            </Select>
            {canManage && (
              <Button variant="brass" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন প্রোডাক্ট
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
        <DialogContent
          className="sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>নতুন প্রোডাক্ট যোগ করুন</DialogTitle>
            <DialogDescription>SKU, নাম, ইউনিট, ক্যাটাগরি ও এক বা একাধিক ভেন্ডরের দাম/রেটিং দিন।</DialogDescription>
          </DialogHeader>
          <ProductForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent
          className="sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>প্রোডাক্ট এডিট করুন</DialogTitle>
            <DialogDescription>
              এই পরিবর্তন সব ভেন্ডরের জন্য প্রযোজ্য হবে। নিচে প্রতিটি ভেন্ডরের দাম/রেটিং/স্ট্যাটাসও এখান থেকেই পরিবর্তন করা যাবে।
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductDetailsEditForm
              productId={editingProduct.id}
              defaultValues={{
                sku: editingProduct.sku,
                name: editingProduct.name,
                unit: editingProduct.unit,
                categoryIds: editingProduct.categories.map((c) => c.id),
                description: editingProduct.description ?? "",
                thumbnailUrl: editingProduct.thumbnailUrl,
                imageUrls: editingProduct.imageUrls,
              }}
              vendors={editingProduct.vendors}
              onSuccess={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ProductActivityLogModal
        productId={historyId}
        productName={historyProduct?.name ?? ""}
        onOpenChange={(open) => !open && setHistoryId(null)}
      />
    </>
  );
}

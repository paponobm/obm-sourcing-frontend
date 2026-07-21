"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, History, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Avatar } from "@/components/shared/Avatar";
import { SearchBox } from "@/components/shared/SearchBox";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { VendorPendingRequisitionBadge } from "@/components/vendor/VendorPendingRequisitionBadge";
import { VendorEditForm } from "@/components/forms/VendorEditForm";
import { RequireRole } from "@/components/shared/RequireRole";
import { useVendors, useActivateVendor, useDeactivateVendor } from "@/hooks/useVendors";
import { useDebounce } from "@/hooks/use-debounce";
import { useHasRole } from "@/hooks/useHasRole";
import { ROUTES } from "@/constants/routes";
import { MANAGE_CATALOG_ROLES } from "@/constants/roles";
import { vendorStatusBadgeVariant, VENDOR_STATUS_LABEL_BN } from "@/utils/status";
import type { Vendor } from "@/types/vendor.types";
import type { VendorSortColumn } from "@/services/vendor.service";
import type { SortDirection } from "@/types/common.types";

const PAGE_SIZE = 10;

export default function VendorListPage() {
  return (
    <RequireRole roles={["SUPER_ADMIN", "VIEWER"]}>
      <VendorListContent />
    </RequireRole>
  );
}

function VendorListContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active");
  const [sortColumn, setSortColumn] = useState<VendorSortColumn>("shopName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);
  const canManage = useHasRole(MANAGE_CATALOG_ROLES);
  const activateVendor = useActivateVendor();
  const deactivateVendor = useDeactivateVendor();

  const { data, isLoading } = useVendors({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    statusFilter,
    sortColumn,
    sortDirection,
  });

  const editingVendor = data?.data.find((v) => v.id === editingId);

  const handleSortChange = (column: string) => {
    const col = column as VendorSortColumn;
    if (col === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const columns: DataTableColumn<Vendor>[] = [
    {
      key: "serial",
      header: "ক্রমিক",
      render: (v) => {
        const index = (data?.data ?? []).findIndex((row) => row.id === v.id);
        return <span className="text-gray">{(page - 1) * PAGE_SIZE + index + 1}</span>;
      },
    },
    {
      key: "shopName",
      header: "দোকানের নাম",
      sortable: true,
      render: (v) => (
        <Link
          href={ROUTES.vendorDetail(v.id)}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center text-sm md:text-base lg:text-lg xl:text-xl"
        >
          <Avatar initials={v.shopName.slice(0, 2)} imageUrl={v.imageUrl} />
          {v.shopName}
          <VendorPendingRequisitionBadge items={v.pendingRequisitions} />
        </Link>
      ),
    },
    {
      key: "address",
      header: "ঠিকানা",
      render: (v) => <span className="text-gray">{v.address}</span>,
    },
    {
      key: "whatsapp",
      header: "হোয়াটসঅ্যাপ",
      render: (v) => <span className="font-mono text-gray">{v.whatsapp}</span>,
    },
    {
      key: "productCount",
      header: "প্রোডাক্ট সংখ্যা",
      sortable: true,
      render: (v) => `${v.productCount} টি`,
    },
    {
      key: "status",
      header: "স্ট্যাটাস",
      sortable: true,
      render: (v) => (
        <Badge variant={vendorStatusBadgeVariant(v.status)}>
          {VENDOR_STATUS_LABEL_BN[v.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (v) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push(`${ROUTES.vendorDetail(v.id)}?tab=activityLog`)}
          >
            <History className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
          </Button>
          {canManage && (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(v.id)}>
                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
              </Button>
              {v.status === "ACTIVE" ? (
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="ghost" size="sm">
                      <Ban className="h-3 w-3 text-red sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                    </Button>
                  }
                  title="ভেন্ডর নিষ্ক্রিয় করুন"
                  description={`আপনি "${v.shopName}"-কে নিষ্ক্রিয় করতে চলেছেন। এই ভেন্ডরের সব অ্যাক্টিভ প্রোডাক্ট (যদি অন্য কোনো অ্যাক্টিভ ভেন্ডর না থাকে) নিষ্ক্রিয় হয়ে যাবে এবং নতুন অর্ডার বা রিকুইজিশনের জন্য উপলব্ধ থাকবে না। ভেন্ডরকে আবার সক্রিয় করলে এই পরিবর্তন ফিরিয়ে আনা যাবে। আপনি কি নিশ্চিত?`}
                  confirmLabel="নিশ্চিত নিষ্ক্রিয় করুন"
                  onConfirm={() => deactivateVendor.mutate(v.id)}
                  isLoading={deactivateVendor.isPending}
                />
              ) : (
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="ghost" size="sm">
                      <CheckCircle2 className="h-3 w-3 text-teal sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                    </Button>
                  }
                  title="ভেন্ডরটি সক্রিয় করবেন?"
                  description={`আপনি কি নিশ্চিত "${v.shopName}"-কে সক্রিয় করতে চান? এই ভেন্ডরের কারণে নিষ্ক্রিয় হওয়া প্রোডাক্টগুলো আবার সক্রিয় হয়ে যাবে।`}
                  confirmLabel="সক্রিয় করুন"
                  onConfirm={() => activateVendor.mutate(v.id)}
                  isLoading={activateVendor.isPending}
                />
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <Topbar
        title={`ভেন্ডর তালিকা (${data?.total ?? "..."})`}
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="ভেন্ডর সার্চ করুন..."
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
                <SelectItem value="active">অ্যাক্টিভ ভেন্ডর</SelectItem>
                <SelectItem value="inactive">ইনঅ্যাক্টিভ ভেন্ডর</SelectItem>
                <SelectItem value="all">সব ভেন্ডর</SelectItem>
              </SelectContent>
            </Select>
            {canManage && (
              <Button asChild variant="brass">
                <Link href={ROUTES.vendorNew}>
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন ভেন্ডর
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          rowKey={(v) => v.id}
          isLoading={isLoading}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onRowClick={(v) => router.push(ROUTES.vendorDetail(v.id))}
          emptyTitle="কোনো ভেন্ডর পাওয়া যায়নি"
          emptyDescription="অন্য কিছু সার্চ করুন অথবা নতুন ভেন্ডর যোগ করুন।"
        />
      </Card>

      <Dialog open={Boolean(editingVendor)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ভেন্ডর এডিট করুন</DialogTitle>
          </DialogHeader>
          {editingVendor && (
            <VendorEditForm
              vendor={editingVendor}
              onSuccess={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

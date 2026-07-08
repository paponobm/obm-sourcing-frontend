"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { SearchBox } from "@/components/shared/SearchBox";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { useVendors } from "@/hooks/useVendors";
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<VendorSortColumn>("shopName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const debouncedSearch = useDebounce(search);
  const canManage = useHasRole(MANAGE_CATALOG_ROLES);

  const { data, isLoading } = useVendors({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    sortColumn,
    sortDirection,
  });

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
      key: "shopName",
      header: "দোকানের নাম",
      sortable: true,
      render: (v) => (
        <Link
          href={ROUTES.vendorDetail(v.id)}
          className="flex items-center text-sm hover:underline md:text-base lg:text-lg xl:text-xl"
        >
          <Avatar initials={v.shopName.slice(0, 2)} imageUrl={v.imageUrl} />
          {v.shopName}
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
  ];

  return (
    <>
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
          emptyTitle="কোনো ভেন্ডর পাওয়া যায়নি"
          emptyDescription="অন্য কিছু সার্চ করুন অথবা নতুন ভেন্ডর যোগ করুন।"
        />
      </Card>
    </>
  );
}

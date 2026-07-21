"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { SearchBox } from "@/components/shared/SearchBox";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { RequireRole } from "@/components/shared/RequireRole";
import { useActivities } from "@/hooks/useActivities";
import { useDebounce } from "@/hooks/use-debounce";
import { formatBnDate } from "@/utils/date";
import type { ActivityLog } from "@/types/activity.types";

const PAGE_SIZE = 15;

const TARGET_LABEL_BN: Record<string, string> = {
  VENDOR: "ভেন্ডর",
  PRODUCT: "প্রোডাক্ট",
  USER: "ইউজার",
  COURIER: "কুরিয়ার",
};

export default function ActivityLogsPage() {
  return (
    <RequireRole roles={["SUPER_ADMIN", "VIEWER"]}>
      <ActivityLogsContent />
    </RequireRole>
  );
}

function ActivityLogsContent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useActivities({ page, pageSize: PAGE_SIZE, search: debouncedSearch });

  const columns: DataTableColumn<ActivityLog>[] = [
    { key: "actorName", header: "ব্যবহারকারী", render: (a) => <b>{a.actorName}</b> },
    { key: "action", header: "কার্যক্রম", render: (a) => a.action },
    {
      key: "targetType",
      header: "সংশ্লিষ্ট",
      render: (a) => (a.targetType ? TARGET_LABEL_BN[a.targetType] : "—"),
    },
    { key: "targetLabel", header: "বিবরণ", render: (a) => a.targetLabel ?? "—" },
    { key: "createdAt", header: "তারিখ", render: (a) => formatBnDate(a.createdAt) },
  ];

  return (
    <>
      <Topbar
        title="অ্যাক্টিভিটি লগ"
        actions={
          <SearchBox
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="ব্যবহারকারী বা কার্যক্রম সার্চ করুন..."
          />
        }
      />

      <Card>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          rowKey={(a) => a.id}
          isLoading={isLoading}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          emptyTitle="কোনো অ্যাক্টিভিটি পাওয়া যায়নি"
        />
      </Card>
    </>
  );
}

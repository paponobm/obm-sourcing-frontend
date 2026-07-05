"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { SearchBox } from "@/components/shared/SearchBox";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { useUsers } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/use-debounce";
import type { User } from "@/types/user.types";

const PAGE_SIZE = 10;

const ROLE_LABEL_BN: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  MANAGER: "Manager",
  VIEWER: "Viewer",
};

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useUsers({ page, pageSize: PAGE_SIZE, search: debouncedSearch });

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: "নাম",
      render: (u) => (
        <span className="flex items-center">
          <Avatar initials={u.avatarInitial} />
          {u.name}
        </span>
      ),
    },
    { key: "phone", header: "ফোন নাম্বার", render: (u) => <span className="font-mono">{u.phone}</span> },
    { key: "role", header: "রোল", render: (u) => ROLE_LABEL_BN[u.role] },
    {
      key: "status",
      header: "স্ট্যাটাস",
      render: (u) => (
        <Badge variant={u.status === "ACTIVE" ? "active" : "inactive"}>
          {u.status === "ACTIVE" ? "অ্যাক্টিভ" : "ইনঅ্যাক্টিভ"}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="ইউজার ম্যানেজমেন্ট"
        actions={
          <SearchBox
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="ইউজার সার্চ করুন..."
          />
        }
      />

      <Card>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          rowKey={(u) => u.id}
          isLoading={isLoading}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          emptyTitle="কোনো ইউজার পাওয়া যায়নি"
        />
      </Card>
    </>
  );
}

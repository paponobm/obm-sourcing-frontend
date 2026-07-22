"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { SearchBox } from "@/components/shared/SearchBox";
import { RequireRole } from "@/components/shared/RequireRole";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserForm } from "@/components/forms/UserForm";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { useUsers, useUpdateUser } from "@/hooks/useUsers";
import { useCurrentUser } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/use-debounce";
import { ROLE_LABEL_BN, SUPER_ADMIN_ONLY } from "@/constants/roles";
import type { User, UserRole } from "@/types/user.types";

const PAGE_SIZE = 10;

function UserManagementContent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  const { data: currentUser } = useCurrentUser();
  const { data, isLoading } = useUsers({ page, pageSize: PAGE_SIZE, search: debouncedSearch });
  const updateUser = useUpdateUser();

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
    {
      key: "role",
      header: "রোল",
      render: (u) => (
        <Select
          value={u.role}
          disabled={u.id === currentUser?.id}
          onValueChange={(role) => updateUser.mutate({ id: u.id, input: { role: role as UserRole } })}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABEL_BN).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="ইউজার সার্চ করুন..."
            />
            <Button variant="brass" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> নতুন ইউজার
            </Button>
          </div>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>নতুন ইউজার তৈরি করুন</DialogTitle>
            <DialogDescription>নাম, ফোন নাম্বার, পাসওয়ার্ড ও রোল দিন।</DialogDescription>
          </DialogHeader>
          <UserForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function UserManagementPage() {
  return (
    <RequireRole roles={SUPER_ADMIN_ONLY}>
      <UserManagementContent />
    </RequireRole>
  );
}

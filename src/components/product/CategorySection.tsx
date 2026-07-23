"use client";

import { useState } from "react";
import { Plus, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SearchBox } from "@/components/shared/SearchBox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { Avatar } from "@/components/shared/Avatar";
import { useCategories, useActivateCategory, useDeactivateCategory } from "@/hooks/useCategories";
import { useHasRole } from "@/hooks/useHasRole";
import { useDebounce } from "@/hooks/use-debounce";
import { SUPER_ADMIN_ONLY } from "@/constants/roles";
import { vendorStatusBadgeVariant, VENDOR_STATUS_LABEL_BN } from "@/utils/status";
import { toBnDigits } from "@/utils/date";

export function CategorySection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active");
  const { data: categories, isLoading } = useCategories({ search: debouncedSearch, statusFilter });
  const activateCategory = useActivateCategory();
  const deactivateCategory = useDeactivateCategory();
  const canManage = useHasRole(SUPER_ADMIN_ONLY);
  const showActionsColumn = canManage;

  const editingCategory = categories?.find((c) => c.id === editingId);

  return (
    <>
      <Topbar
        title={`প্রোডাক্ট ক্যাটাগরি (${categories != null ? toBnDigits(categories.length) : "..."})`}
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox value={search} onChange={setSearch} placeholder="ক্যাটাগরি সার্চ করুন..." />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "active" | "inactive" | "all")}>
              <SelectTrigger className="sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">অ্যাক্টিভ ক্যাটাগরি</SelectItem>
                <SelectItem value="inactive">ইনঅ্যাক্টিভ ক্যাটাগরি</SelectItem>
                <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
              </SelectContent>
            </Select>
            {canManage && (
              <Button variant="brass" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন ক্যাটাগরি
              </Button>
            )}
          </div>
        }
      />

      <Card>
        {isLoading && (
          <div className="space-y-2 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {!isLoading && categories?.length === 0 && (
          <EmptyState
            title="কোনো ক্যাটাগরি পাওয়া যায়নি"
            description="অন্য কিছু সার্চ করুন অথবা নতুন ক্যাটাগরি যোগ করুন।"
          />
        )}

        {!isLoading && categories && categories.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">ক্রমিক</TableHead>
                <TableHead>নাম</TableHead>
                <TableHead>প্রোডাক্ট সংখ্যা</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                {showActionsColumn && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c, index) => (
                <TableRow key={c.id}>
                  <TableCell className="text-center font-mono text-gray">{toBnDigits(index + 1)}</TableCell>
                  <TableCell>
                    <span className="flex items-center text-sm md:text-base lg:text-lg xl:text-xl">
                      <Avatar initials={c.name.slice(0, 2)} imageUrl={c.imageUrl} />
                      {c.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono">{toBnDigits(c.productCount)} টি</TableCell>
                  <TableCell>
                    <Badge variant={vendorStatusBadgeVariant(c.status)}>{VENDOR_STATUS_LABEL_BN[c.status]}</Badge>
                  </TableCell>
                  {showActionsColumn && (
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(c.id)}>
                          <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                        </Button>
                        {c.status === "ACTIVE" ? (
                          <ConfirmDialog
                            trigger={
                              <Button type="button" variant="ghost" size="sm">
                                <Ban className="h-3 w-3 text-red sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                            }
                            title="ক্যাটাগরি নিষ্ক্রিয় করুন"
                            description={
                              c.activeProductCount > 0
                                ? `এই ক্যাটাগরিতে ${toBnDigits(c.activeProductCount)}টি অ্যাক্টিভ প্রোডাক্ট আছে — নিষ্ক্রিয় করার আগে সেগুলো নিষ্ক্রিয় করতে হবে।`
                                : `"${c.name}" ক্যাটাগরিটি নিষ্ক্রিয় করা হবে। আপনি কি নিশ্চিত?`
                            }
                            confirmLabel="নিষ্ক্রিয় করুন"
                            onConfirm={() => deactivateCategory.mutate(c.id)}
                            isLoading={deactivateCategory.isPending}
                          />
                        ) : (
                          <ConfirmDialog
                            trigger={
                              <Button type="button" variant="ghost" size="sm">
                                <CheckCircle2 className="h-3 w-3 text-teal sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                            }
                            title="ক্যাটাগরিটি সক্রিয় করবেন?"
                            description={`আপনি কি নিশ্চিত "${c.name}" সক্রিয় করতে চান?`}
                            confirmLabel="সক্রিয় করুন"
                            onConfirm={() => activateCategory.mutate(c.id)}
                            isLoading={activateCategory.isPending}
                          />
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>নতুন ক্যাটাগরি যোগ করুন</DialogTitle>
            <DialogDescription>ক্যাটাগরির নাম দিন।</DialogDescription>
          </DialogHeader>
          <CategoryForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingCategory)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>ক্যাটাগরি এডিট করুন</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              categoryId={editingCategory.id}
              defaultValues={{ name: editingCategory.name, imageUrl: editingCategory.imageUrl }}
              onSuccess={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

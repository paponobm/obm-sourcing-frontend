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
import { UnitForm } from "@/components/forms/UnitForm";
import { useUnits, useActivateUnit, useDeactivateUnit } from "@/hooks/useUnits";
import { useHasRole } from "@/hooks/useHasRole";
import { useDebounce } from "@/hooks/use-debounce";
import { SUPER_ADMIN_ONLY } from "@/constants/roles";
import { vendorStatusBadgeVariant, VENDOR_STATUS_LABEL_BN } from "@/utils/status";
import { toBnDigits } from "@/utils/date";

export function UnitSection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active");
  const { data: units, isLoading } = useUnits({ search: debouncedSearch, statusFilter });
  const activateUnit = useActivateUnit();
  const deactivateUnit = useDeactivateUnit();
  const canManage = useHasRole(SUPER_ADMIN_ONLY);
  const showActionsColumn = canManage;

  const editingUnit = units?.find((u) => u.id === editingId);

  return (
    <>
      <Topbar
        title={`ইউনিট ম্যানেজমেন্ট (${units != null ? toBnDigits(units.length) : "..."})`}
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox value={search} onChange={setSearch} placeholder="ইউনিট সার্চ করুন..." />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "active" | "inactive" | "all")}>
              <SelectTrigger className="sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">অ্যাক্টিভ ইউনিট</SelectItem>
                <SelectItem value="inactive">ইনঅ্যাক্টিভ ইউনিট</SelectItem>
                <SelectItem value="all">সব ইউনিট</SelectItem>
              </SelectContent>
            </Select>
            {canManage && (
              <Button variant="brass" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন ইউনিট
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

        {!isLoading && units?.length === 0 && (
          <EmptyState title="কোনো ইউনিট পাওয়া যায়নি" description="অন্য কিছু সার্চ করুন অথবা নতুন ইউনিট যোগ করুন।" />
        )}

        {!isLoading && units && units.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">ক্রমিক</TableHead>
                <TableHead>ইউনিট</TableHead>
                <TableHead>মোট প্রোডাক্ট</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                {showActionsColumn && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((u, index) => (
                <TableRow key={u.id}>
                  <TableCell className="text-center font-mono text-gray">{toBnDigits(index + 1)}</TableCell>
                  <TableCell>
                    <span className="text-sm md:text-base lg:text-lg xl:text-xl">{u.name}</span>
                  </TableCell>
                  <TableCell className="font-mono">{toBnDigits(u.productCount)} টি</TableCell>
                  <TableCell>
                    <Badge variant={vendorStatusBadgeVariant(u.status)}>{VENDOR_STATUS_LABEL_BN[u.status]}</Badge>
                  </TableCell>
                  {showActionsColumn && (
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(u.id)}>
                          <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                        </Button>
                        {u.status === "ACTIVE" ? (
                          <ConfirmDialog
                            trigger={
                              <Button type="button" variant="ghost" size="sm">
                                <Ban className="h-3 w-3 text-red sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                            }
                            title="ইউনিট নিষ্ক্রিয় করুন"
                            description={
                              u.activeProductCount > 0
                                ? `এই ইউনিটে ${toBnDigits(u.activeProductCount)}টি অ্যাক্টিভ প্রোডাক্ট আছে — নিষ্ক্রিয় করার আগে সেগুলো নিষ্ক্রিয় করতে হবে।`
                                : `"${u.name}" ইউনিটটি নিষ্ক্রিয় করা হবে। আপনি কি নিশ্চিত?`
                            }
                            confirmLabel="নিষ্ক্রিয় করুন"
                            onConfirm={() => deactivateUnit.mutate(u.id)}
                            isLoading={deactivateUnit.isPending}
                          />
                        ) : (
                          <ConfirmDialog
                            trigger={
                              <Button type="button" variant="ghost" size="sm">
                                <CheckCircle2 className="h-3 w-3 text-teal sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                            }
                            title="ইউনিটটি সক্রিয় করবেন?"
                            description={`আপনি কি নিশ্চিত "${u.name}" সক্রিয় করতে চান?`}
                            confirmLabel="সক্রিয় করুন"
                            onConfirm={() => activateUnit.mutate(u.id)}
                            isLoading={activateUnit.isPending}
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
            <DialogTitle>নতুন ইউনিট যোগ করুন</DialogTitle>
            <DialogDescription>ইউনিটের নাম দিন।</DialogDescription>
          </DialogHeader>
          <UnitForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingUnit)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>ইউনিট এডিট করুন</DialogTitle>
          </DialogHeader>
          {editingUnit && (
            <UnitForm
              unitId={editingUnit.id}
              defaultValues={{ name: editingUnit.name }}
              onSuccess={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

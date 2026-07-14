"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UnitForm } from "@/components/forms/UnitForm";
import { useUnits, useDeleteUnit } from "@/hooks/useUnits";
import { useHasRole } from "@/hooks/useHasRole";
import { MANAGE_CATALOG_ROLES, SUPER_ADMIN_ONLY } from "@/constants/roles";

export function UnitSection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: units, isLoading } = useUnits();
  const deleteUnit = useDeleteUnit();
  const canManage = useHasRole(MANAGE_CATALOG_ROLES);
  const canDelete = useHasRole(SUPER_ADMIN_ONLY);
  const showActionsColumn = canManage || canDelete;

  const editingUnit = units?.find((u) => u.id === editingId);

  return (
    <>
      <Topbar
        title={`ইউনিট ম্যানেজমেন্ট (${units?.length ?? "..."})`}
        actions={
          canManage && (
            <Button variant="brass" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন ইউনিট
            </Button>
          )
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
          <EmptyState title="কোনো ইউনিট পাওয়া যায়নি" description="নতুন ইউনিট যোগ করুন।" />
        )}

        {!isLoading && units && units.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ইউনিট</TableHead>
                <TableHead>মোট প্রোডাক্ট</TableHead>
                {showActionsColumn && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <span className="text-sm md:text-base lg:text-lg xl:text-xl">{u.name}</span>
                  </TableCell>
                  <TableCell>{u.productCount} টি</TableCell>
                  {showActionsColumn && (
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        {canManage && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(u.id)}>
                            <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <ConfirmDialog
                            trigger={
                              <Button type="button" variant="ghost" size="sm">
                                <Trash2 className="h-3 w-3 text-red sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                            }
                            title="ইউনিট মুছে ফেলবেন?"
                            description={
                              u.productCount > 0
                                ? "এই ইউনিটটি বর্তমানে প্রোডাক্টে ব্যবহৃত হচ্ছে। আগে প্রোডাক্ট থেকে ইউনিট পরিবর্তন করুন।"
                                : `"${u.name}" ইউনিটটি মুছে ফেলা হবে। এই কাজটি ফিরিয়ে আনা যাবে না।`
                            }
                            confirmLabel="মুছে ফেলুন"
                            onConfirm={() => deleteUnit.mutate(u.id)}
                            isLoading={deleteUnit.isPending}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নতুন ইউনিট যোগ করুন</DialogTitle>
            <DialogDescription>ইউনিটের নাম দিন।</DialogDescription>
          </DialogHeader>
          <UnitForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingUnit)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
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

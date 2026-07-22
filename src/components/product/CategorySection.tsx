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
import { CategoryForm } from "@/components/forms/CategoryForm";
import { Avatar } from "@/components/shared/Avatar";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { useHasRole } from "@/hooks/useHasRole";
import { SUPER_ADMIN_ONLY } from "@/constants/roles";
import { toBnDigits } from "@/utils/date";

export function CategorySection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  const canManage = useHasRole(SUPER_ADMIN_ONLY);
  const canDelete = useHasRole(SUPER_ADMIN_ONLY);
  const showActionsColumn = canManage || canDelete;

  const editingCategory = categories?.find((c) => c.id === editingId);

  return (
    <>
      <Topbar
        title={`প্রোডাক্ট ক্যাটাগরি (${categories != null ? toBnDigits(categories.length) : "..."})`}
        actions={
          canManage && (
            <Button variant="brass" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন ক্যাটাগরি
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

        {!isLoading && categories?.length === 0 && (
          <EmptyState
            title="কোনো ক্যাটাগরি পাওয়া যায়নি"
            description="নতুন ক্যাটাগরি যোগ করুন।"
          />
        )}

        {!isLoading && categories && categories.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>প্রোডাক্ট সংখ্যা</TableHead>
                {showActionsColumn && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="flex items-center text-sm md:text-base lg:text-lg xl:text-xl">
                      <Avatar initials={c.name.slice(0, 2)} imageUrl={c.imageUrl} />
                      {c.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono">{toBnDigits(c.productCount)} টি</TableCell>
                  {showActionsColumn && (
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        {canManage && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(c.id)}>
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
                            title="ক্যাটাগরি মুছে ফেলবেন?"
                            description={
                              c.productCount > 0
                                ? `এই ক্যাটাগরিতে ${toBnDigits(c.productCount)}টি প্রোডাক্ট আছে — মুছে ফেলার আগে সেগুলোকে অন্য ক্যাটাগরিতে সরাতে হবে।`
                                : `"${c.name}" ক্যাটাগরিটি মুছে ফেলা হবে। এই কাজটি ফিরিয়ে আনা যাবে না।`
                            }
                            confirmLabel="মুছে ফেলুন"
                            onConfirm={() => deleteCategory.mutate(c.id)}
                            isLoading={deleteCategory.isPending}
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
            <DialogTitle>নতুন ক্যাটাগরি যোগ করুন</DialogTitle>
            <DialogDescription>ক্যাটাগরির নাম দিন।</DialogDescription>
          </DialogHeader>
          <CategoryForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingCategory)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
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

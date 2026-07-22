"use client";

import { useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CourierForm } from "@/components/forms/CourierForm";
import { Avatar } from "@/components/shared/Avatar";
import { useCouriers, useActivateCourier, useDeactivateCourier } from "@/hooks/useCouriers";
import { useHasRole } from "@/hooks/useHasRole";
import { SUPER_ADMIN_ONLY } from "@/constants/roles";
import { vendorStatusBadgeVariant, VENDOR_STATUS_LABEL_BN } from "@/utils/status";
import { toBnDigits } from "@/utils/date";

export function CourierSection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: couriers, isLoading } = useCouriers();
  const activateCourier = useActivateCourier();
  const deactivateCourier = useDeactivateCourier();
  const canManage = useHasRole(SUPER_ADMIN_ONLY);

  const filteredCouriers = useMemo(() => {
    if (!couriers) return couriers;
    const q = search.trim().toLowerCase();
    if (!q) return couriers;
    return couriers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.primaryMobile.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q),
    );
  }, [couriers, search]);

  const editingCourier = couriers?.find((c) => c.id === editingId);

  return (
    <>
      <Topbar
        title={`কুরিয়ার (${couriers != null ? toBnDigits(couriers.length) : "..."})`}
        actions={
          <div className="flex items-center gap-2">
            <SearchBox value={search} onChange={setSearch} placeholder="কুরিয়ার সার্চ করুন..." />
            {canManage && (
              <Button variant="brass" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> নতুন কুরিয়ার
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

        {!isLoading && filteredCouriers?.length === 0 && (
          <EmptyState
            title="কোনো কুরিয়ার পাওয়া যায়নি"
            description="নতুন কুরিয়ার যোগ করুন।"
          />
        )}

        {!isLoading && filteredCouriers && filteredCouriers.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>প্রাইমারি মোবাইল</TableHead>
                <TableHead>লোকেশন</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                {canManage && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCouriers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="flex items-center text-sm md:text-base lg:text-lg xl:text-xl">
                      <Avatar initials={c.name.slice(0, 2)} imageUrl={c.logoUrl} />
                      {c.name}
                    </span>
                  </TableCell>
                  <TableCell>{c.primaryMobile}</TableCell>
                  <TableCell>{c.location}</TableCell>
                  <TableCell>
                    <Badge variant={vendorStatusBadgeVariant(c.status)}>{VENDOR_STATUS_LABEL_BN[c.status]}</Badge>
                  </TableCell>
                  {canManage && (
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
                            title="কুরিয়ার নিষ্ক্রিয় করবেন?"
                            description={`আপনি কি নিশ্চিত "${c.name}" নিষ্ক্রিয় করতে চান?`}
                            confirmLabel="নিষ্ক্রিয় করুন"
                            onConfirm={() => deactivateCourier.mutate(c.id)}
                            isLoading={deactivateCourier.isPending}
                          />
                        ) : (
                          <ConfirmDialog
                            trigger={
                              <Button type="button" variant="ghost" size="sm">
                                <CheckCircle2 className="h-3 w-3 text-teal sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                            }
                            title="কুরিয়ার সক্রিয় করবেন?"
                            description={`আপনি কি নিশ্চিত "${c.name}" সক্রিয় করতে চান?`}
                            confirmLabel="সক্রিয় করুন"
                            onConfirm={() => activateCourier.mutate(c.id)}
                            isLoading={activateCourier.isPending}
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
            <DialogTitle>নতুন কুরিয়ার যোগ করুন</DialogTitle>
            <DialogDescription>কুরিয়ারের তথ্য দিন।</DialogDescription>
          </DialogHeader>
          <CourierForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingCourier)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>কুরিয়ার এডিট করুন</DialogTitle>
          </DialogHeader>
          {editingCourier && (
            <CourierForm
              courierId={editingCourier.id}
              defaultValues={{
                name: editingCourier.name,
                primaryMobile: editingCourier.primaryMobile,
                additionalMobiles: editingCourier.additionalMobiles,
                location: editingCourier.location,
                logoUrl: editingCourier.logoUrl,
              }}
              onSuccess={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVendors } from "@/hooks/useVendors";
import { useUsers } from "@/hooks/useUsers";
import { ORDER_STATUS_LABEL_BN } from "@/utils/status";
import type { OrderStatus } from "@/types/invoice.types";
import type { OrderSortMode } from "@/types/order.types";

const ORDER_STATUSES: OrderStatus[] = ["IN_TRANSIT", "RECEIVED", "DISCREPANCY", "VERIFIED", "CLOSED"];

const SORT_OPTIONS: { value: OrderSortMode; label: string }[] = [
  { value: "newest", label: "সবচেয়ে নতুন আগে" },
  { value: "oldest", label: "সবচেয়ে পুরাতন আগে" },
  { value: "vendorAsc", label: "ভেন্ডরের নাম (A-Z)" },
  { value: "vendorDesc", label: "ভেন্ডরের নাম (Z-A)" },
  { value: "costHigh", label: "সর্বোচ্চ খরচ আগে" },
  { value: "costLow", label: "সর্বনিম্ন খরচ আগে" },
  { value: "pendingFirst", label: "পেন্ডিং আগে" },
  { value: "receivedFirst", label: "রিসিভড আগে" },
  { value: "closedFirst", label: "ক্লোজড আগে" },
  { value: "discrepancyFirst", label: "ডিসক্রেপান্সি আগে" },
];

export function OrderAdvancedFilters({
  status,
  onStatusChange,
  vendorId,
  onVendorIdChange,
  createdById,
  onCreatedByIdChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sortMode,
  onSortModeChange,
}: {
  /** Comma-joined OrderStatus value(s), or "" for all — shared 1:1 with the
   * Quick Filter tabs' state. A multi-value string (e.g. the Received tab's
   * "RECEIVED,VERIFIED") won't match any single option here, so this select
   * just shows blank in that case; the quick-filter pill still shows active. */
  status: string;
  onStatusChange: (value: string) => void;
  vendorId: string;
  onVendorIdChange: (value: string) => void;
  createdById: string;
  onCreatedByIdChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  sortMode: OrderSortMode;
  onSortModeChange: (value: OrderSortMode) => void;
}) {
  const { data: vendorsPage } = useVendors({ page: 1, pageSize: 100 });
  const { data: usersPage } = useUsers({ page: 1, pageSize: 100 });

  return (
    <div className="mb-3.5 flex flex-col gap-2.5 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center">
      {/* <Select value={status || "all"} onValueChange={(v) => onStatusChange(v === "all" ? "" : v)}>
        <SelectTrigger className="sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {ORDER_STATUS_LABEL_BN[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}

      <Select value={vendorId || "all"} onValueChange={(v) => onVendorIdChange(v === "all" ? "" : v)}>
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="সব ভেন্ডর" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">সব ভেন্ডর</SelectItem>
          {vendorsPage?.data.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              {v.shopName} ({v.vendorCode})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="sm:w-40"
          aria-label="শুরুর তারিখ"
        />
        <span className="text-gray">–</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="sm:w-40"
          aria-label="শেষ তারিখ"
        />
      </div>

      <Select value={createdById || "all"} onValueChange={(v) => onCreatedByIdChange(v === "all" ? "" : v)}>
        <SelectTrigger className="sm:w-44">
          <SelectValue placeholder="সব ইউজার" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">তৈরি করেছেন — সবাই</SelectItem>
          {usersPage?.data.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortMode} onValueChange={(v) => onSortModeChange(v as OrderSortMode)}>
        <SelectTrigger className="sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

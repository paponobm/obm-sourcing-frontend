"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchBox } from "@/components/shared/SearchBox";
import { ORDER_STATUS_LABEL_BN } from "@/utils/status";
import type { OrderStatus } from "@/types/invoice.types";

const ORDER_STATUSES: OrderStatus[] = ["IN_TRANSIT", "RECEIVED", "DISCREPANCY", "VERIFIED", "CLOSED"];

export function OrderHistoryFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: OrderStatus | "all";
  onStatusFilterChange: (value: OrderStatus | "all") => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}) {
  return (
    <div className="mb-3.5 flex flex-col gap-2.5 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchBox value={search} onChange={onSearchChange} placeholder="ইনভয়েস নম্বর সার্চ করুন..." />
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as OrderStatus | "all")}>
        <SelectTrigger className="sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
          {ORDER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {ORDER_STATUS_LABEL_BN[status]}
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
    </div>
  );
}

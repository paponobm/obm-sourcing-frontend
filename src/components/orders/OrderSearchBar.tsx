"use client";

import { SearchBox } from "@/components/shared/SearchBox";

export function OrderSearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <SearchBox
      className="border-4 border-orange-600"
      value={value}
      onChange={onChange}
      placeholder="ইনভয়েস নম্বর, ভেন্ডর, ভেন্ডর আইডি বা প্রোডাক্ট সার্চ করুন..."
    />
  );
}

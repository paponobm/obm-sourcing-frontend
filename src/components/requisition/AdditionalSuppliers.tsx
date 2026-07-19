"use client";

import { useState } from "react";
import { SuggestedVendorBadge } from "@/components/requisition/SuggestedVendorBadge";
import type { RequisitionItem } from "@/types/requisition.types";

/**
 * "আরও দেখুন" toggle meant to render directly inside the same flex-wrap row
 * as the item's SuggestedVendorBadge (so everything sits on one line,
 * wrapping only if the row runs out of width). Hidden entirely when there's
 * no other vendor to show.
 *
 * Collapsed: just the "আরও দেখুন" button.
 * Expanded: every other active vendor as the same badge+tooltip UI as the
 * main Suggested Supplier (`SuggestedVendorBadge` reused via `plain`, same
 * tooltip, no second implementation), followed by a "বন্ধ করুন" button as
 * the last item in the row.
 *
 * All of this data (every active vendor for the product, each already
 * carrying price/orderCount/lastOrderedAt) arrives with the requisition
 * list/detail response itself — see requisitions.service.ts's
 * `toSuggestedVendorCandidates` — so expand/collapse is purely local state,
 * nothing is fetched.
 */
export function AdditionalSuppliers({ item }: { item: RequisitionItem }) {
  const [expanded, setExpanded] = useState(false);

  const otherVendors = item.suggestedVendors.filter((v) => v.vendorId !== item.suggestedVendor?.vendorId);
  if (otherVendors.length === 0) return null;

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-[11px] font-semibold text-red hover:underline sm:text-xs"
      >
        আরও দেখুন
      </button>
    );
  }

  return (
    <>
      {otherVendors.map((v) => (
        <SuggestedVendorBadge key={v.vendorId} vendor={v} plain />
      ))}
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="text-[11px] font-semibold text-red hover:underline sm:text-xs"
      >
        বন্ধ করুন
      </button>
    </>
  );
}

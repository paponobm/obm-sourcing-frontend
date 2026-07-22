"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { toBnDigits } from "@/utils/date";

export type PieSlice = {
  name: string;
  value: number;
  color: string;
};

/** Shared "% + legend" pie chart for every Dashboard section (Products,
 * Vendors, Orders, Requisitions) — each section just supplies its own
 * labeled/colored slices, so the chart chrome (tooltip, legend, percentage
 * labels, responsive sizing) is never re-implemented per section. Slices
 * with a 0 value are dropped before rendering — recharts renders a 0-value
 * slice as an invisible sliver that still eats a legend row, which looks
 * broken rather than simply "no data yet". */
export function SectionPieChart({ data, emptyLabel = "কোনো তথ্য নেই" }: { data: PieSlice[]; emptyLabel?: string }) {
  const slices = data.filter((d) => d.value > 0);
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center text-xs text-gray sm:text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={75}
          paddingAngle={2}
          label={({ percent }) => `${toBnDigits(Math.round((percent ?? 0) * 100))}%`}
          labelLine={false}
        >
          {slices.map((slice) => (
            <Cell key={slice.name} fill={slice.color} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${toBnDigits(Number(value))} টি`, name]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--line)",
            fontSize: 12,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

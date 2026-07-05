import type { ReactNode } from "react";

export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-[22px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}

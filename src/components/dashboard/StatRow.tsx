import type { ReactNode } from "react";

export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-5 sm:grid-cols-2 sm:gap-3.5 lg:mb-[22px] lg:grid-cols-4">
      {children}
    </div>
  );
}

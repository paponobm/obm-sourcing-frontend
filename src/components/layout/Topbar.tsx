import type { ReactNode } from "react";

export function Topbar({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="m-0 font-serif text-[1.1875rem] text-teal-dark">{title}</h2>
      {actions}
    </div>
  );
}

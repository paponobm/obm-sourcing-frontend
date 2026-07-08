import type { ReactNode } from "react";

export function Topbar({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-2.5 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <h2 className="m-0 font-serif text-base text-teal-dark sm:text-lg lg:text-[1.1875rem] xl:text-xl">
        {title}
      </h2>
      {actions}
    </div>
  );
}

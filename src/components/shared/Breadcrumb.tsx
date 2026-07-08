import Link from "next/link";
import { Fragment } from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="mb-1.5 text-[11px] text-gray sm:mb-2 sm:text-xs lg:text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={item.label}>
            {index > 0 && " / "}
            {isLast || !item.href ? (
              <b className="text-teal-dark">{item.label}</b>
            ) : (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

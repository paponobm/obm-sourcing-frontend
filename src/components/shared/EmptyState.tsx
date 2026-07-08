import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-10 text-center sm:gap-2 sm:px-6 sm:py-12 lg:py-16">
      <Icon className="h-6 w-6 text-line sm:h-7 sm:w-7 lg:h-8 lg:w-8" strokeWidth={1.5} />
      <p className="font-serif text-sm text-teal-dark sm:text-base lg:text-lg">{title}</p>
      {description && <p className="max-w-sm text-xs text-gray sm:text-sm">{description}</p>}
      {action}
    </div>
  );
}

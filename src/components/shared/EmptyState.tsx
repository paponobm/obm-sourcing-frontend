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
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Icon className="h-8 w-8 text-line" strokeWidth={1.5} />
      <p className="font-serif text-base text-teal-dark">{title}</p>
      {description && <p className="max-w-sm text-sm text-gray">{description}</p>}
      {action}
    </div>
  );
}

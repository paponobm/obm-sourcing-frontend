import type { ActivityLog } from "@/types/activity.types";
import { formatRelativeBn } from "@/utils/date";

export function ActivityItem({ activity }: { activity: ActivityLog }) {
  return (
    <div className="flex gap-2 border-b border-paper-2 py-2 text-xs last:border-b-0 sm:gap-2.5 sm:py-[9px] sm:text-[0.78125rem]">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
      <div>
        <div>
          <b>{activity.actorName}</b> — {activity.action}
          {activity.targetLabel ? ` (${activity.targetLabel})` : ""}
        </div>
        <div className="text-[0.625rem] text-gray sm:text-[0.6875rem]">
          {formatRelativeBn(activity.createdAt)}
        </div>
      </div>
    </div>
  );
}

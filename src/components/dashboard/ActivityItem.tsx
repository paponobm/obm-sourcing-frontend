import type { ActivityLog } from "@/types/activity.types";
import { formatRelativeBn } from "@/utils/date";

export function ActivityItem({ activity }: { activity: ActivityLog }) {
  return (
    <div className="flex gap-2.5 border-b border-paper-2 py-[9px] text-[12.5px] last:border-b-0">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
      <div>
        <div>
          <b>{activity.actorName}</b> — {activity.action}
          {activity.targetLabel ? ` (${activity.targetLabel})` : ""}
        </div>
        <div className="text-[11px] text-gray">{formatRelativeBn(activity.createdAt)}</div>
      </div>
    </div>
  );
}

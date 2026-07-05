import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityItem } from "./ActivityItem";
import type { ActivityLog } from "@/types/activity.types";

export function ActivityFeed({
  activities,
  isLoading,
}: {
  activities: ActivityLog[] | undefined;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>অ্যাক্টিভিটি</CardTitle>
      </CardHeader>
      <CardContent className="px-[18px] pb-3.5 pt-1.5">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-2.5 py-[9px]">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        {!isLoading && activities?.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </CardContent>
    </Card>
  );
}

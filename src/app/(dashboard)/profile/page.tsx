"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/shared/Avatar";
import { InfoRow } from "@/components/vendor/InfoRow";
import { useCurrentUser } from "@/hooks/useAuth";
import { ROLE_LABEL_BN } from "@/constants/roles";

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <>
      <Topbar title="প্রোফাইল" />
      <div className="max-w-md">
        <Card>
          <div className="p-5">
            {isLoading || !user ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <Avatar initials={user.avatarInitial} className="h-10 w-10 text-sm" />
                  <div>
                    <div className="font-serif text-lg text-teal-dark">{user.name}</div>
                    <div className="text-xs text-gray">{ROLE_LABEL_BN[user.role]}</div>
                  </div>
                </div>
                <InfoRow label="ফোন নাম্বার" value={user.phone} mono />
                <InfoRow label="ইমেইল" value={user.email ?? "—"} />
                <InfoRow
                  label="স্ট্যাটাস"
                  value={
                    <Badge variant={user.status === "ACTIVE" ? "active" : "inactive"}>
                      {user.status === "ACTIVE" ? "অ্যাক্টিভ" : "ইনঅ্যাক্টিভ"}
                    </Badge>
                  }
                  noBorder
                />
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

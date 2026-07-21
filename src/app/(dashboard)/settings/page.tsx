import { Settings } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { RequireRole } from "@/components/shared/RequireRole";

export default function SettingsPage() {
  return (
    <RequireRole roles={["SUPER_ADMIN", "VIEWER"]}>
      <Topbar title="সেটিংস" />
      <Card>
        <EmptyState
          icon={Settings}
          title="শীঘ্রই আসছে"
          description="সিস্টেম সেটিংস এখানে পরে যোগ করা হবে।"
        />
      </Card>
    </RequireRole>
  );
}

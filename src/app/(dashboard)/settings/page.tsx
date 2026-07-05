import { Settings } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";

export default function SettingsPage() {
  return (
    <>
      <Topbar title="সেটিংস" />
      <Card>
        <EmptyState
          icon={Settings}
          title="শীঘ্রই আসছে"
          description="সিস্টেম সেটিংস এখানে পরে যোগ করা হবে।"
        />
      </Card>
    </>
  );
}

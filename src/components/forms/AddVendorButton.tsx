import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddVendorButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onClick}>
      <Plus className="h-3.5 w-3.5" /> আরেকটি ভেন্ডর যোগ করুন
    </Button>
  );
}

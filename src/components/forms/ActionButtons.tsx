import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

export function ActionButtons({
  onCancel,
  isPending,
  savingLabel,
  saveLabel,
}: {
  onCancel: () => void;
  isPending: boolean;
  savingLabel: string;
  saveLabel: string;
}) {
  return (
    <DialogFooter>
      <Button type="button" variant="ghost" disabled={isPending} onClick={onCancel}>
        বাতিল
      </Button>
      <Button type="submit" variant="brass" disabled={isPending}>
        {isPending ? savingLabel : saveLabel}
      </Button>
    </DialogFooter>
  );
}

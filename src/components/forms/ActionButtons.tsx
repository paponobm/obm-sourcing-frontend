import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

export function ActionButtons({
  onCancel,
  isPending,
  savingLabel,
  saveLabel,
  disabled = false,
}: {
  onCancel: () => void;
  isPending: boolean;
  savingLabel: string;
  saveLabel: string;
  /** Disables Save beyond the isPending state — e.g. a custom field in the
   * form (like a searchable combobox) hasn't resolved to a valid value yet. */
  disabled?: boolean;
}) {
  return (
    <DialogFooter>
      <Button type="button" variant="ghost" disabled={isPending} onClick={onCancel}>
        বাতিল
      </Button>
      <Button type="submit" variant="brass" disabled={isPending || disabled}>
        {isPending ? savingLabel : saveLabel}
      </Button>
    </DialogFooter>
  );
}

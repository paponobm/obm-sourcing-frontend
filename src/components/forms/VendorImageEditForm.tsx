"use client";

import { useState } from "react";
import { useUpdateVendor } from "@/hooks/useVendors";
import { useUploadImage } from "@/hooks/useUploadImage";
import { resolveImageValue, type ImageValue } from "@/lib/image-value";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

/** Image-only edit — not a full vendor-details form, since that's out of scope here. */
export function VendorImageEditForm({
  vendorId,
  currentImageUrl,
  onSuccess,
}: {
  vendorId: string;
  currentImageUrl?: string;
  onSuccess: () => void;
}) {
  const [imageValue, setImageValue] = useState<ImageValue>(currentImageUrl);
  const updateVendor = useUpdateVendor();
  const uploadImage = useUploadImage();
  const isPending = uploadImage.isPending || updateVendor.isPending;

  const handleSave = async () => {
    const imageUrl = await resolveImageValue(imageValue, (file) => uploadImage.mutateAsync(file));
    await updateVendor.mutateAsync({ id: vendorId, input: { imageUrl } });
    onSuccess();
  };

  return (
    <div className="space-y-3.5">
      <ImageUploadField value={imageValue} onChange={setImageValue} size="md" />
      <DialogFooter>
        <Button type="button" variant="brass" disabled={isPending} onClick={handleSave}>
          {isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
        </Button>
      </DialogFooter>
    </div>
  );
}

import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { MultiImageUploadField } from "@/components/shared/MultiImageUploadField";
import type { ImageValue } from "@/lib/image-value";

/** Main (thumbnail) and additional images side by side instead of stacked. */
export function ImageUploadSection({
  thumbnailValue,
  onThumbnailChange,
  imageValues,
  onImageValuesChange,
}: {
  thumbnailValue: ImageValue;
  onThumbnailChange: (value: ImageValue) => void;
  imageValues: (File | string)[];
  onImageValuesChange: (value: (File | string)[]) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-3.5 gap-y-3 sm:grid-cols-2">
      <div>
        <Label>মেইন ছবি (ঐচ্ছিক)</Label>
        <ImageUploadField value={thumbnailValue} onChange={onThumbnailChange} />
      </div>
      <div>
        <Label>আরও ছবি (ঐচ্ছিক)</Label>
        <MultiImageUploadField value={imageValues} onChange={onImageValuesChange} />
      </div>
    </div>
  );
}

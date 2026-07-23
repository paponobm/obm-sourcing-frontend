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
  thumbnailRequired,
  thumbnailError,
}: {
  thumbnailValue: ImageValue;
  onThumbnailChange: (value: ImageValue) => void;
  imageValues: (File | string)[];
  onImageValuesChange: (value: (File | string)[]) => void;
  /** Only the new-product create form sets this — edit forms leave the
   * thumbnail optional exactly as before (an existing product may have been
   * created before this requirement existed). */
  thumbnailRequired?: boolean;
  thumbnailError?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-3.5 gap-y-3 sm:grid-cols-2">
      <div>
        <Label>মেইন ছবি{thumbnailRequired ? " *" : " (ঐচ্ছিক)"}</Label>
        <ImageUploadField value={thumbnailValue} onChange={onThumbnailChange} />
        {thumbnailError && <p className="mt-1 text-[11px] text-red sm:text-xs">{thumbnailError}</p>}
      </div>
      <div>
        <Label>আরও ছবি (ঐচ্ছিক)</Label>
        <MultiImageUploadField value={imageValues} onChange={onImageValuesChange} />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { ImagePlus, X } from "lucide-react";

/** Same deferred-upload approach as ImageUploadField, for a gallery of images. */
export function MultiImageUploadField({
  value,
  onChange,
}: {
  value: (File | string)[];
  onChange: (value: (File | string)[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onChange([...value, file]);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {value.map((item, index) => (
        <ImageThumb key={index} item={item} onRemove={() => removeAt(index)} />
      ))}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-line bg-paper-2 text-gray hover:border-teal"
      >
        <ImagePlus className="h-5 w-5" />
      </button>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

function ImageThumb({ item, onRemove }: { item: File | string; onRemove: () => void }) {
  const url = useMemo(() => (item instanceof File ? URL.createObjectURL(item) : item), [item]);

  useEffect(() => {
    return () => {
      if (item instanceof File) URL.revokeObjectURL(url);
    };
  }, [item, url]);

  return (
    <div className="relative h-16 w-16">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-16 w-16 rounded-md border border-line object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="ছবি সরান"
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red text-white"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

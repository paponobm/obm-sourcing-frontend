/**
 * A picked-but-not-yet-uploaded file (File), an existing/already-uploaded
 * URL (string), or nothing. Upload fields hold this instead of eagerly
 * hitting Cloudinary on file selection — the actual upload happens once,
 * at form-submit time, via resolveImageValue/resolveImageValues below.
 */
export type ImageValue = File | string | undefined;

export async function resolveImageValue(
  value: ImageValue,
  upload: (file: File) => Promise<string>,
): Promise<string | undefined> {
  if (value instanceof File) return upload(value);
  return value;
}

export async function resolveImageValues(
  values: (File | string)[],
  upload: (file: File) => Promise<string>,
): Promise<string[]> {
  return Promise.all(values.map((v) => (v instanceof File ? upload(v) : v)));
}

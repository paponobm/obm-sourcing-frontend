"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadService } from "@/services/upload.service";
import { getApiErrorMessage } from "@/lib/api-error";

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadService.uploadImage(file),
    onError: (error) => toast.error(getApiErrorMessage(error, "ছবি আপলোড করা যায়নি")),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { backupService } from "@/services/backup.service";
import { getApiErrorMessage } from "@/lib/api-error";

const BACKUPS_KEY = ["backups"] as const;

export function useBackups() {
  return useQuery({
    queryKey: BACKUPS_KEY,
    queryFn: () => backupService.list(),
    // A running backup can take a while — poll so "Backup Now" reflects
    // Completed/Uploaded without the admin having to refresh the page.
    refetchInterval: (query) => (query.state.data?.some((b) => b.status === "RUNNING") ? 3000 : false),
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => backupService.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKUPS_KEY });
      toast.success("ব্যাকআপ সম্পন্ন হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "ব্যাকআপ তৈরি করা যায়নি")),
  });
}

export function useDeleteLocalBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => backupService.deleteLocalCopy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKUPS_KEY });
      toast.success("লোকাল কপি মুছে ফেলা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "লোকাল কপি মুছে ফেলা যায়নি")),
  });
}

export function useDeleteDriveBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => backupService.deleteDriveCopy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKUPS_KEY });
      toast.success("Google Drive কপি মুছে ফেলা হয়েছে");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Google Drive কপি মুছে ফেলা যায়নি")),
  });
}

export function useDownloadBackup() {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName: string }) => backupService.download(id, fileName),
    onError: (error) => toast.error(getApiErrorMessage(error, "ব্যাকআপ ডাউনলোড করা যায়নি")),
  });
}

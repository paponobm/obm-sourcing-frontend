"use client";

import { Download, DatabaseBackup, HardDriveDownload, CloudOff } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { RequireRole } from "@/components/shared/RequireRole";
import {
  useBackups,
  useCreateBackup,
  useDeleteLocalBackup,
  useDeleteDriveBackup,
  useDownloadBackup,
} from "@/hooks/useBackups";
import { SUPER_ADMIN_ONLY } from "@/constants/roles";
import { formatBnDate, formatBnTime, toBnDigits } from "@/utils/date";
import type { Backup, BackupUploadStatus } from "@/types/backup.types";

const UPLOAD_STATUS_LABEL_BN: Record<BackupUploadStatus, string> = {
  PENDING: "অপেক্ষমাণ",
  UPLOADING: "আপলোড হচ্ছে...",
  UPLOADED: "আপলোড সম্পন্ন",
  FAILED: "আপলোড ব্যর্থ",
  DELETED: "মুছে ফেলা হয়েছে",
};

const UPLOAD_STATUS_VARIANT: Record<BackupUploadStatus, BadgeProps["variant"]> = {
  PENDING: "pending",
  UPLOADING: "pending",
  UPLOADED: "statusActive",
  FAILED: "destructive",
  DELETED: "inactive",
};

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${toBnDigits(bytes)} B`;
  if (bytes < 1024 * 1024) return `${toBnDigits((bytes / 1024).toFixed(1))} KB`;
  return `${toBnDigits((bytes / (1024 * 1024)).toFixed(1))} MB`;
}

function BackupHistoryContent() {
  const { data: backups, isLoading } = useBackups();
  const createBackup = useCreateBackup();
  const deleteLocal = useDeleteLocalBackup();
  const deleteDrive = useDeleteDriveBackup();
  const downloadBackup = useDownloadBackup();

  const isDownloading = (id: string) => downloadBackup.isPending && downloadBackup.variables?.id === id;
  const isDeletingLocal = (id: string) => deleteLocal.isPending && deleteLocal.variables === id;
  const isDeletingDrive = (id: string) => deleteDrive.isPending && deleteDrive.variables === id;

  return (
    <>
      <Topbar
        title="ডাটাবেস ব্যাকআপ"
        actions={
          <ConfirmDialog
            trigger={
              <Button type="button" variant="brass" disabled={createBackup.isPending}>
                <DatabaseBackup className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {createBackup.isPending ? "ব্যাকআপ চলছে..." : "Backup Now"}
              </Button>
            }
            title="এখনই ব্যাকআপ নেবেন?"
            description="সম্পূর্ণ ডাটাবেসের একটি .sql ব্যাকআপ তৈরি হবে এবং Google Drive-এ আপলোড হবে। এতে কিছুটা সময় লাগতে পারে।"
            confirmLabel="Backup Now"
            onConfirm={() => createBackup.mutate()}
            isLoading={createBackup.isPending}
          />
        }
      />

      <Card>
        {isLoading && (
          <div className="space-y-2 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {!isLoading && backups?.length === 0 && (
          <EmptyState
            title="এখনো কোনো ব্যাকআপ নেই"
            description={`উপরের "Backup Now" বাটনে ক্লিক করে প্রথম ব্যাকআপ তৈরি করুন।`}
          />
        )}

        {!isLoading && backups && backups.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">ক্রমিক</TableHead>
                  <TableHead>ব্যাকআপ নাম</TableHead>
                  <TableHead>তারিখ ও সময়</TableHead>
                  <TableHead>ফাইল সাইজ</TableHead>
                  <TableHead>আপলোড স্ট্যাটাস</TableHead>
                  <TableHead>Google Drive File ID</TableHead>
                  <TableHead>তৈরি করেছেন</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((b: Backup, index) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-center font-mono text-gray">{toBnDigits(index + 1)}</TableCell>
                    <TableCell className="font-mono text-xs sm:text-sm">{b.fileName}</TableCell>
                    <TableCell className="font-mono text-gray">
                      {formatBnDate(b.createdAt)} {formatBnTime(b.createdAt)}
                    </TableCell>
                    <TableCell className="font-mono">{formatFileSize(b.fileSizeBytes)}</TableCell>
                    <TableCell>
                      {b.status === "FAILED" ? (
                        <Badge variant="destructive">ব্যাকআপ ব্যর্থ</Badge>
                      ) : b.status === "RUNNING" ? (
                        <Badge variant="pending">চলছে...</Badge>
                      ) : (
                        <Badge variant={UPLOAD_STATUS_VARIANT[b.uploadStatus]}>
                          {UPLOAD_STATUS_LABEL_BN[b.uploadStatus]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate font-mono text-xs text-gray" title={b.googleDriveFileId ?? undefined}>
                      {b.googleDriveFileId ?? "—"}
                    </TableCell>
                    <TableCell className="text-gray">{b.createdByName}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={(!b.localFileExists && !b.googleDriveFileId) || isDownloading(b.id)}
                          onClick={() => downloadBackup.mutate({ id: b.id, fileName: b.fileName })}
                        >
                          <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                        </Button>
                        {b.localFileExists && (
                          <ConfirmDialog
                            trigger={
                              <Button type="button" variant="ghost" size="sm">
                                <HardDriveDownload className="h-3 w-3 text-red sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                            }
                            title="লোকাল কপি মুছে ফেলবেন?"
                            description={`"${b.fileName}"-এর সার্ভারে থাকা লোকাল কপিটি মুছে ফেলা হবে। Google Drive কপি অপরিবর্তিত থাকবে।`}
                            confirmLabel="মুছে ফেলুন"
                            onConfirm={() => deleteLocal.mutate(b.id)}
                            isLoading={isDeletingLocal(b.id)}
                          />
                        )}
                        {b.googleDriveFileId && (
                          <ConfirmDialog
                            trigger={
                              <Button type="button" variant="ghost" size="sm">
                                <CloudOff className="h-3 w-3 text-red sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                            }
                            title="Google Drive কপি মুছে ফেলবেন?"
                            description={`"${b.fileName}"-এর Google Drive কপিটি স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি ফিরিয়ে আনা যাবে না।`}
                            confirmLabel="মুছে ফেলুন"
                            onConfirm={() => deleteDrive.mutate(b.id)}
                            isLoading={isDeletingDrive(b.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </>
  );
}

export default function BackupHistoryPage() {
  return (
    <RequireRole roles={SUPER_ADMIN_ONLY}>
      <BackupHistoryContent />
    </RequireRole>
  );
}

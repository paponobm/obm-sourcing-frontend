export type BackupStatus = "RUNNING" | "COMPLETED" | "FAILED";
export type BackupUploadStatus = "PENDING" | "UPLOADING" | "UPLOADED" | "FAILED" | "DELETED";

export type Backup = {
  id: string;
  fileName: string;
  status: BackupStatus;
  errorMessage: string | null;
  fileSizeBytes: number | null;
  uploadStatus: BackupUploadStatus;
  googleDriveFileId: string | null;
  uploadErrorMessage: string | null;
  /** Whether the .sql file is still present on the server's local disk —
   * normally false shortly after a successful upload (deleted to save
   * space), so Download/Delete Local only make sense while this is true. */
  localFileExists: boolean;
  createdByName: string;
  startedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
};

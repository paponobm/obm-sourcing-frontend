export type ActivityLog = {
  id: string;
  actorName: string;
  action: string;
  targetType?: "VENDOR" | "PRODUCT" | "USER";
  targetLabel?: string;
  createdAt: string;
};

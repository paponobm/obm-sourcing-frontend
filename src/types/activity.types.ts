export type ActivityLog = {
  id: string;
  actorName: string;
  action: string;
  targetType?: "VENDOR" | "PRODUCT" | "USER" | "COURIER";
  targetLabel?: string;
  createdAt: string;
};

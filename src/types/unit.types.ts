export type Unit = {
  id: string;
  name: string;
  productCount: number;
  createdAt: string;
};

export type CreateUnitInput = {
  name: string;
};

export type UpdateUnitInput = Partial<CreateUnitInput>;

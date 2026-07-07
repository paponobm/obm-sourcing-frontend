export type Category = {
  id: string;
  name: string;
  productCount: number;
  createdAt: string;
};

export type CreateCategoryInput = {
  name: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

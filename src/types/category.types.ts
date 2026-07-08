export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
  productCount: number;
  createdAt: string;
};

export type CreateCategoryInput = {
  name: string;
  imageUrl?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

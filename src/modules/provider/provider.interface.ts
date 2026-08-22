export type TGearPayload = {
  title: string;
  description: string;
  brand: string;
  image: string;
  pricePerDay: number;
  stock: number;
  isAvailable?: boolean;
  categoryId: string;
};

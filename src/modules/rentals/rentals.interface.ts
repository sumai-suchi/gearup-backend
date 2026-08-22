export type TRentalOrderItemPayload = {
  gearId: string;
  quantity: number;
};

export type TRentalOrderPayload = {
  startDate: string;
  endDate: string;
  items: TRentalOrderItemPayload[];
};

export type TCreateReviewPayload = {
  gearId: string;
  rating: number;
  comment: string;
};

export type TUpdateReviewPayload = {
  rating?: number;
  comment?: string;
};

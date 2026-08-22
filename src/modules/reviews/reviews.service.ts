import { prisma } from "../../lib/prisma";
import type { TCreateReviewPayload, TUpdateReviewPayload } from "./reviews.interface";

const createReviewInDB = async (customerId: string, payload: TCreateReviewPayload) => {
  const { gearId, rating, comment } = payload;

  if (!gearId || rating === undefined || !comment) {
    throw new Error("gearId, rating, and comment are required");
  }

  const parsedRating = Number(rating);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    throw new Error("Rating must be a number between 1 and 5");
  }

  // 1. Check if gear item exists
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new Error("Gear item not found");
  }

  // 2. Check if the customer has already reviewed this gear item
  const existingReview = await prisma.review.findUnique({
    where: {
      customerId_gearId: {
        customerId,
        gearId,
      },
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this gear item");
  }

  // 3. Create review
  const result = await prisma.review.create({
    data: {
      customerId,
      gearId,
      rating: parsedRating,
      comment,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gear: true,
    },
  });

  return result;
};

const getReviewsByGearIdFromDB = async (gearId: string) => {
  const result = await prisma.review.findMany({
    where: { gearId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getUserReviewsFromDB = async (customerId: string) => {
  const result = await prisma.review.findMany({
    where: { customerId },
    include: {
      gear: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const deleteReviewFromDB = async (customerId: string, reviewId: string, role: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (role !== "ADMIN" && review.customerId !== customerId) {
    throw new Error("You are not authorized to delete this review");
  }

  const result = await prisma.review.delete({
    where: { id: reviewId },
  });

  return result;
};

export const ReviewService = {
  createReviewInDB,
  getReviewsByGearIdFromDB,
  getUserReviewsFromDB,
  deleteReviewFromDB,
};

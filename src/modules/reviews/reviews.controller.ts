import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catch.async";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./reviews.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const result = await ReviewService.createReviewInDB(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review added successfully",
    data: result,
  });
});

const getReviewsByGearId = catchAsync(async (req: Request, res: Response) => {
  const { gearId } = req.params;
  const result = await ReviewService.getReviewsByGearIdFromDB(gearId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

const getUserReviews = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const result = await ReviewService.getUserReviewsFromDB(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your reviews retrieved successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const role = req.user.role;
  const { id } = req.params;
  const result = await ReviewService.deleteReviewFromDB(customerId, id as string, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: result,
  });
});

export const reviewsController = {
  createReview,
  getReviewsByGearId,
  getUserReviews,
  deleteReview,
};

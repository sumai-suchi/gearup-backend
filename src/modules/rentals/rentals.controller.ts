import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catch.async";
import sendResponse from "../../utils/sendResponse";
import { RentalService } from "./rentals.service";

const createRentalOrder = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  console.log("customerId", customerId);
  console.log(req.body)
  const result = await RentalService.createRentalOrderInDB(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order placed successfully",
    data: result,
  });
});

const getUserRentals = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const result = await RentalService.getUserRentalsFromDB(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental orders retrieved successfully",
    data: result,
  });
});

const getRentalById = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const userRole = req.user.role;
  const { id } = req.params;
  const result = await RentalService.getRentalByIdFromDB(customerId, id as string, userRole);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order details retrieved successfully",
    data: result,
  });
});

export const rentalsController = {
  createRentalOrder,
  getUserRentals,
  getRentalById,
};

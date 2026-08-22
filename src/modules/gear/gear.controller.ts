import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catch.async";
import sendResponse from "../../utils/sendResponse";
import sendErrorResponse from "../../utils/errorResponse";
import { GearService } from "./gear.service";

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await GearService.getAllGearFromDB(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear items retrieved successfully",
    data: result,
  });
});

const getGearById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GearService.getGearByIdFromDB(id as string);

  if (!result) {
    return sendErrorResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: "Gear item not found",
      error: "Not Found",
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear details retrieved successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await GearService.getAllCategoriesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Categories retrieved successfully",
    data: result,
  });
});

export const gearController = {
  getAllGear,
  getGearById,
  getAllCategories,
};

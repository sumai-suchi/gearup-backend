import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catch.async";
import sendResponse from "../../utils/sendResponse";
import { ProviderService } from "./provider.service";

const addGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user.id;
  const result = await ProviderService.addGearIntoDB(providerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear item added successfully",
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user.id;
  const { id } = req.params;
  const result = await ProviderService.updateGearInDB(providerId, id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item updated successfully",
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user.id;
  const { id } = req.params;
  const result = await ProviderService.deleteGearFromDB(providerId, id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item deleted successfully",
    data: result,
  });
});

const getIncomingOrders = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user.id;
  const result = await ProviderService.getIncomingOrdersFromDB(providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Incoming rental orders retrieved successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user.id;
  const { id } = req.params;
  const { status } = req.body;
  const result = await ProviderService.updateOrderStatusInDB(providerId, id as string, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order status updated successfully",
    data: result,
  });
});

export const providerController = {
  addGear,
  updateGear,
  deleteGear,
  getIncomingOrders,
  updateOrderStatus,
};

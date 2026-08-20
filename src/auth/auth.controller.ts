import { catchAsync } from "../utils/catch.async";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";

import type { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";

const loginUser = catchAsync(async (req: Request, res: Response , next : NextFunction) => {
  const result = await AuthService.loginUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      data: result,
    });
});

export const authController = {
  loginUser,
};
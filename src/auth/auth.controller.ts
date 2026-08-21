import { catchAsync } from "../utils/catch.async";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";

import type { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";

const loginUser = catchAsync(async (req: Request, res: Response , next : NextFunction) => {
  const {
    accessToken,
    refreshToken
  } = await AuthService.loginUser(req.body);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure : false,
    sameSite : "none",
    maxAge: 24 * 60 * 60 * 1000
  })
  
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure : false,
    sameSite : "none",
    maxAge: 24 * 60 * 60 * 1000 *7
  })
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      data: {
        accessToken,
        refreshToken
      },
    });
});


export const authController = {
  loginUser,

};
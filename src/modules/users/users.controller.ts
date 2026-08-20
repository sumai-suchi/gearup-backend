import type { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./users.service";
import sendErrorResponse from "../../utils/errorResponse";

const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.registerUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    sendErrorResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Failed to register user",
      error: (error as Error).message,
      data: null,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.loginUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      data: result,
    });
  } catch (error) {
    sendErrorResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Failed to login user",
      error: (error as Error).message,
      data: null,
    });
  }
};

export const userController = {
  registerUser,
  loginUser
};


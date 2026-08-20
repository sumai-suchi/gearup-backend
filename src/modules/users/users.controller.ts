import type { Request, Response } from "express"
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./users.service";








const registerUser = async (req: Request, res: Response) => {
  const result = await UserService.registerUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
};



export const  userController= {
    registerUser
}
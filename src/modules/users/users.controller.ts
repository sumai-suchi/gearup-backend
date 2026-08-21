import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./users.service";
import jwt from "jsonwebtoken";
import { catchAsync } from "../../utils/catch.async";
import config from "../../config";
import { JwtUtils } from "../../utils/jwt";




const  registerUser = catchAsync(async (req: Request, res: Response , next : NextFunction) => {
  const result = await UserService.registerUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

const MyProfile = catchAsync(async (req: Request, res: Response , next : NextFunction) => {
   const cookie = req.cookies
   console.log(cookie)

   const verifyedTokenn = JwtUtils.verifyToken(cookie.accessToken, config.jwt_access_secret as string)
   console.log( "verifyedTokenn",verifyedTokenn)

  //  const verifyToken = jwt.verify(cookie.accessToken, config.jwt_access_secret as string)
  //  console.log(verifyToken)


  
   const user = await UserService.MyProfileDB(verifyedTokenn?.id as string)
   console.log(user)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User profile retrieved successfully",
    data: user,
  });
});




export const userController = {
  registerUser,
  MyProfile

};


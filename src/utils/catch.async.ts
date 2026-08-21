import type { NextFunction, Request, RequestHandler, Response } from "express";
import sendErrorResponse from "./errorResponse";
import httpStatus from "http-status";
export const catchAsync =  (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try{
       await fn(req, res, next)
    }
    catch (error : any) {
    sendErrorResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message,
      error: (error as Error).message,
      data: null,
    });
  }
  }
}
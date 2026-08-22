import type { NextFunction, Request, Response } from "express";
import type { Role } from "../../generated/prisma";
import { catchAsync } from "../utils/catch.async";
import sendErrorResponse from "../utils/errorResponse";
import httpStatus from "http-status";
import { JwtUtils } from "../utils/jwt";
import config from "../config";
import { prisma } from "../lib/prisma";
import sendResponse from "../utils/sendResponse";



declare global{
    namespace Express{
        interface Request{
            user : {
                id : string,
                name : string,
                email : string,
                role : string
            }
        }
    }
}


export  const auth = (...requiredRoles: Role[])=>
{
    return catchAsync(async (req: Request, res: Response , next : NextFunction) => {
        const token = req.cookies.accesstoken ? req.cookies.accesstoken
        : req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization?.split(" ")[1] : req.headers.authorization 

        console.log("token", token)
        if(!token)
        {
            return sendErrorResponse(res, {
                success: false,
                statusCode: httpStatus.UNAUTHORIZED,
                message: "You are not authorized to access this route, Unauthorized",
                error: "You are not authorized to access this route, Unauthorized",
                data: null,
              });
        }

        const verifyedTokenn = JwtUtils.verifyToken(token, config.jwt_access_secret as string)
        console.log("verifyedTokenn",verifyedTokenn)
     
        if ( requiredRoles.length && !requiredRoles.includes(verifyedTokenn.role)) {
        return sendResponse(res, {
            success: false,
            statusCode: httpStatus.FORBIDDEN,
            message: "You are not authorized to access this route, Forbidden",
           

        })
      }
      console.log( requiredRoles.includes(verifyedTokenn.role))

      const user = await prisma.user.findUnique({
        where : {
            id : verifyedTokenn.id
        }
      })
      console.log("user", user)

      if(!user)
      {
        return sendErrorResponse(res, {
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "You are not authorized to access this route, Unauthorized",
            error: "You are not authorized to access this route, Unauthorized",
            data: null,
          });
      }

      if(user.status == "SUSPENDED"){
        return sendErrorResponse(res, {
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "You are not authorized to access this route, Unauthorized",
            error: "You are not authorized to access this route, Unauthorized",
            data: null,
          });
      }

      if(user.role != verifyedTokenn.role)
      {
        return sendErrorResponse(res, {
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "You are not authorized to access this route, Unauthorized",
            error: "You are not authorized to access this route, Unauthorized",
            data: null,
          });
      }

       req.user = {
        id : verifyedTokenn.id,
        name : verifyedTokenn.name,
        email : verifyedTokenn.email,
        role : verifyedTokenn.role
      }
        next();
    })
}
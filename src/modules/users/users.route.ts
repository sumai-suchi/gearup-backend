import  { Router, type NextFunction, type Request, type Response } from "express"
import { userController } from "./users.controller";

import { Role } from "../../../generated/prisma";

import { auth } from "../../midlewares/auth";


const router = Router();




router.post("/register", userController.registerUser);
router.get("/me",auth(Role.CUSTOMER, Role.ADMIN, Role.PROVIDER), userController.MyProfile);



export  const  userRoute = router
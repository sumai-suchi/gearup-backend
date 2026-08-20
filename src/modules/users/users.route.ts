import  { Router, type Request, type Response } from "express"
import { userController } from "./users.controller";

const router = Router();

router.post("/register", userController.registerUser);


export  const  userRoute = router
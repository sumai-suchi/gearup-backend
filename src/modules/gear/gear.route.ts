import { Router } from "express";
import { gearController } from "./gear.controller";

const gearRouter = Router();
const categoryRouter = Router();


gearRouter.get("/", gearController.getAllGear);
gearRouter.get("/:id", gearController.getGearById);


categoryRouter.get("/", gearController.getAllCategories);

export const gearRoute = gearRouter;
export const categoryRoute = categoryRouter;

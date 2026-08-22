import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../midlewares/auth";
import { Role } from "../../../generated/prisma";

const router = Router();


router.post("/categories", auth(Role.ADMIN), adminController.createCategory);
router.put("/categories/:id", auth(Role.ADMIN), adminController.updateCategory);
router.delete("/categories/:id", auth(Role.ADMIN), adminController.deleteCategory);


router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.patch("/users/:id", auth(Role.ADMIN), adminController.updateUserStatus);


router.get("/gear", auth(Role.ADMIN), adminController.getAllGear);


router.get("/rentals", auth(Role.ADMIN), adminController.getAllRentals);

export const adminRoute = router;

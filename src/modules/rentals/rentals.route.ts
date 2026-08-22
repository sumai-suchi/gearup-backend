import { Router } from "express";
import { rentalsController } from "./rentals.controller";
import { auth } from "../../midlewares/auth";
import { Role } from "../../../generated/prisma";

const router = Router();

router.post("/", auth(Role.CUSTOMER), rentalsController.createRentalOrder);
router.get("/", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), rentalsController.getUserRentals);
router.get("/:id", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), rentalsController.getRentalById);

export const rentalRoute = router;

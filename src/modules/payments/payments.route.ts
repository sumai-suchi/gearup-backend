import { Router } from "express";
import { paymentsController } from "./payments.controller";
import { auth } from "../../midlewares/auth";
import { Role } from "../../../generated/prisma";

const router = Router();

router.post("/create", auth(Role.CUSTOMER), paymentsController.createPaymentIntent);
router.post("/confirm", paymentsController.confirmPayment);
router.get("/", auth(Role.CUSTOMER), paymentsController.getUserPaymentHistory);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), paymentsController.getPaymentDetails);

export const paymentRoute = router;

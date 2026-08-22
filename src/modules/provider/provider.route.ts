import { Router } from "express";
import { providerController } from "./provider.controller";
import { auth } from "../../midlewares/auth";
import { Role } from "../../../generated/prisma";

const router = Router();

router.post(
  "/gear",
  auth(Role.PROVIDER),
  providerController.addGear
);

router.put(
  "/gear/:id",
  auth(Role.PROVIDER),
  providerController.updateGear
);

router.delete(
  "/gear/:id",
  auth(Role.PROVIDER),
  providerController.deleteGear
);

router.get(
  "/orders",
  auth(Role.PROVIDER),
  providerController.getIncomingOrders
);

router.patch(
  "/orders/:id",
  auth(Role.PROVIDER),
  providerController.updateOrderStatus
);

export const providerRoute = router;
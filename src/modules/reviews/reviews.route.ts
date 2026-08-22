import { Router } from "express";
import { reviewsController } from "./reviews.controller";
import { auth } from "../../midlewares/auth";
import { Role } from "../../../generated/prisma";

const router = Router();

router.post("/", auth(Role.CUSTOMER), reviewsController.createReview);
router.get("/my-reviews", auth(Role.CUSTOMER), reviewsController.getUserReviews);
router.get("/gear/:gearId", reviewsController.getReviewsByGearId);
router.delete("/:id", auth(Role.CUSTOMER, Role.ADMIN), reviewsController.deleteReview);

export const reviewRoute = router;

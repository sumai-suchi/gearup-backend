import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catch.async";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payments.service";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const { rentalOrderId } = req.body;

  if (!rentalOrderId) {
    throw new Error("rentalOrderId is required in request body");
  }

  const result = await PaymentService.createPaymentIntentInDB(customerId, rentalOrderId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment intent created successfully",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  let paymentIntentId = req.body.paymentIntentId;
  let transactionId = req.body.transactionId;

  // Handle Stripe Webhook format if applicable
  if (req.body && req.body.type) {
    const event = req.body;
    if (event.type === "payment_intent.succeeded") {
      const paymentIntentObj = event.data.object;
      paymentIntentId = paymentIntentObj.client_secret || paymentIntentObj.id;
      transactionId = paymentIntentObj.id;
    } else {
      return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Webhook event "${event.type}" acknowledged, no updates needed`,
        data: null,
      });
    }
  }

  if (!paymentIntentId) {
    throw new Error("paymentIntentId is required to confirm payment");
  }

  const result = await PaymentService.confirmPaymentInDB(paymentIntentId, transactionId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment confirmed successfully",
    data: result,
  });
});

const getUserPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const result = await PaymentService.getUserPaymentHistoryFromDB(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment history retrieved successfully",
    data: result,
  });
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user.id;
  const userRole = req.user.role;
  const { id } = req.params;
  const result = await PaymentService.getPaymentDetailsFromDB(customerId, id as string, userRole);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment details retrieved successfully",
    data: result,
  });
});

export const paymentsController = {
  createPaymentIntent,
  confirmPayment,
  getUserPaymentHistory,
  getPaymentDetails,
};

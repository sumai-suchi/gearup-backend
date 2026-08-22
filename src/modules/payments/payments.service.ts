// import Stripe from "stripe";
// import { prisma } from "../../lib/prisma";
// import { PaymentStatus, RentalStatus } from "../../../generated/prisma";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string , {
//   apiVersion: "2023-10-16" as any,
// });

// const createPaymentIntentInDB = async (customerId: string, rentalOrderId: string) => {
 
//   const rentalOrder = await prisma.rentalOrder.findUnique({
//     where: { id: rentalOrderId },
//     include: { payment: true },
//   });

//   if (!rentalOrder) {
//     throw new Error("Rental order not found");
//   }

//   if (rentalOrder.customerId !== customerId) {
//     throw new Error("You are not authorized to pay for this rental order");
//   }

//   if (rentalOrder.status === RentalStatus.CANCELLED) {
//     throw new Error("Cannot pay for a cancelled rental order");
//   }

 
//   if (rentalOrder.payment) {
//     if (rentalOrder.payment.status === PaymentStatus.COMPLETED) {
//       throw new Error("Payment already completed for this order");
//     }
//     return {
//       clientSecret: rentalOrder.payment.paymentIntentId,
//       payment: rentalOrder.payment,
//     };
//   }

 
//   const amountInCents = Math.round(rentalOrder.totalAmount * 100);
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: amountInCents,
//     currency: "usd",
//     metadata: {
//       rentalOrderId,
//       customerId,
//     },
//   });

 
//   const payment = await prisma.payment.create({
//     data: {
//       rentalOrderId,
//       customerId,
//       amount: rentalOrder.totalAmount,
//       paymentIntentId: paymentIntent.client_secret as string,
//       status: PaymentStatus.PENDING,
//     },
//   });

//   return {
//     clientSecret: paymentIntent.client_secret,
//     payment,
//   };
// };

// const confirmPaymentInDB = async (paymentIntentId: string, transactionId?: string) => {
//   // Search database for the payment using either client_secret or payment intent ID
//   const payment = await prisma.payment.findFirst({
//     where: {
//       OR: [
//         { paymentIntentId: paymentIntentId },
//         { paymentIntentId: { contains: paymentIntentId } },
//       ],
//     },
//   });

//   if (!payment) {
//     throw new Error("Payment record not found");
//   }

//   if (payment.status === PaymentStatus.COMPLETED) {
//     return payment;
//   }


//   const result = await prisma.$transaction(async (tx) => {
//     const updatedPayment = await tx.payment.update({
//       where: { id: payment.id },
//       data: {
//         status: PaymentStatus.COMPLETED,
//         transactionId: transactionId || `txn_${Math.random().toString(36).substring(2, 11)}`,
//         paidAt: new Date(),
//       },
//     });

//     await tx.rentalOrder.update({
//       where: { id: payment.rentalOrderId },
//       data: {
//         status: RentalStatus.PAID,
//       },
//     });

//     return updatedPayment;
//   });

//   return result;
// };

// const getUserPaymentHistoryFromDB = async (customerId: string) => {
//   const result = await prisma.payment.findMany({
//     where: { customerId },
//     include: {
//       rentalOrder: {
//         include: {
//           items: {
//             include: {
//               gear: true,
//             },
//           },
//         },
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return result;
// };

// const getPaymentDetailsFromDB = async (customerId: string, paymentId: string, userRole: string) => {
//   const payment = await prisma.payment.findUnique({
//     where: { id: paymentId },
//     include: {
//       rentalOrder: {
//         include: {
//           items: {
//             include: {
//               gear: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!payment) {
//     throw new Error("Payment record not found");
//   }

//   if (userRole !== "ADMIN" && payment.customerId !== customerId) {
//     throw new Error("You are not authorized to view this payment details");
//   }

//   return payment;
// };

// export const PaymentService = {
//   createPaymentIntentInDB,
//   confirmPaymentInDB,
//   getUserPaymentHistoryFromDB,
//   getPaymentDetailsFromDB,
// };

import { prisma } from "../../lib/prisma";
import type { TRentalOrderPayload } from "./rentals.interface";

const createRentalOrderInDB = async (customerId: string, payload: TRentalOrderPayload) => {
  console.log(customerId, "createRentalOrderInDB payload:", payload);
  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid start date or end date format");
  }

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (totalDays <= 0) {
    throw new Error("End date must be after start date");
  }

  if (!payload.items || payload.items.length === 0) {
    throw new Error("Rental order must contain at least one gear item");
  }

  // 1. Fetch all matching gear items to check availability and compute price
  const gearIds = payload.items.map((i) => i.gearId);
  const gears = await prisma.gearItem.findMany({
    where: {
      id: { in: gearIds },
    },
  });

  if (gears.length !== gearIds.length) {
    throw new Error("One or more gear items in the order were not found");
  }

  // Map to speed up lookups
  const gearMap = new Map(gears.map((g) => [g.id, g]));
  let totalAmount = 0;
  const orderItemsData: Array<{
    gearId: string;
    quantity: number;
    pricePerDay: number;
  }> = [];

  for (const item of payload.items) {
    const gear = gearMap.get(item.gearId);
    if (!gear) {
      throw new Error(`Gear item not found: ${item.gearId}`);
    }

    if (!gear.isAvailable) {
      throw new Error(`Gear item "${gear.title}" is currently unavailable`);
    }

    if (gear.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${gear.title}". Available: ${gear.stock}, Requested: ${item.quantity}`);
    }

    totalAmount += gear.pricePerDay * item.quantity * totalDays;
    orderItemsData.push({
      gearId: item.gearId,
      quantity: item.quantity,
      pricePerDay: gear.pricePerDay,
    });
  }

  // 2. Perform database transaction to deduct stock and create order
  const result = await prisma.$transaction(async (tx) => {
    // Update stock levels
    for (const item of payload.items) {
      const gear = gearMap.get(item.gearId)!;
      const newStock = gear.stock - item.quantity;

      await tx.gearItem.update({
        where: { id: item.gearId },
        data: {
          stock: newStock,
          isAvailable: newStock > 0,
        },
      });
    }

    // Create the rental order and items
    const order = await tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalDays,
        totalAmount,
        items: {
          create: orderItemsData.map((item) => ({
            gearId: item.gearId,
            quantity: item.quantity,
            pricePerDay: item.pricePerDay,
          })),
        },
      },
      include: {
        items: {
          include: {
            gear: true,
          },
        },
      },
    });

    return order;
  });

  return result;
};

const getUserRentalsFromDB = async (customerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          gear: true,
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getRentalByIdFromDB = async (customerId: string, orderId: string, userRole: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          gear: true,
        },
      },
      payment: true,
    },
  });

  if (!order) {
    throw new Error("Rental order not found");
  }

  // Authorize: Admin, or the customer who placed the order, or the provider who owns one of the gears
  // Wait, let's verify if the user is authorized.
  if (userRole !== "ADMIN" && order.customerId !== customerId) {
    // If it's a provider, check if they own any gear in this order
    if (userRole === "PROVIDER") {
      const providerOwnsItem = order.items.some((item) => item.gear.providerId === customerId);
      if (!providerOwnsItem) {
        throw new Error("You are not authorized to view this rental order");
      }
    } else {
      throw new Error("You are not authorized to view this rental order");
    }
  }

  return order;
};

export const RentalService = {
  createRentalOrderInDB,
  getUserRentalsFromDB,
  getRentalByIdFromDB,
};

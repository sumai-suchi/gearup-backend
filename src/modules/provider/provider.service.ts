import { prisma } from "../../lib/prisma";
import type { TGearPayload } from "./provider.interface";
import type { RentalStatus } from "../../../generated/prisma";

const addGearIntoDB = async (providerId: string, payload: TGearPayload) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!categoryExists) {
    throw new Error("Category does not exist");
  }

  const gear = await prisma.gearItem.create({
    data: {
      title: payload.title,
      description: payload.description,
      brand: payload.brand,
      image: payload.image,
      pricePerDay: payload.pricePerDay,
      stock: payload.stock,
      isAvailable: payload.isAvailable ?? true,
      categoryId: payload.categoryId,
      providerId,
    },
  });
  return gear;
};

const updateGearInDB = async (providerId: string, gearId: string, payload: Partial<TGearPayload>) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });
  if (!gear) {
    throw new Error("Gear item not found");
  }
  if (gear.providerId !== providerId) {
    throw new Error("You are not authorized to update this gear item");
  }

  if (payload.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!categoryExists) {
      throw new Error("Category does not exist");
    }
  }

  const updatedGear = await prisma.gearItem.update({
    where: { id: gearId },
    data: payload,
  });
  return updatedGear;
};

const deleteGearFromDB = async (providerId: string, gearId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });
  if (!gear) {
    throw new Error("Gear item not found");
  }
  if (gear.providerId !== providerId) {
    throw new Error("You are not authorized to delete this gear item");
  }

  const deletedGear = await prisma.gearItem.delete({
    where: { id: gearId },
  });
  return deletedGear;
};

const getIncomingOrdersFromDB = async (providerId: string) => {
  const orders = await prisma.rentalOrder.findMany({
    where: {
      items: {
        some: {
          gear: {
            providerId,
          },
        },
      },
    },
    include: {
      items: {
        include: {
          gear: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
      payment: true,
    },
  });
  return orders;
};

const updateOrderStatusInDB = async (providerId: string, orderId: string, status: RentalStatus) => {
  const order = await prisma.rentalOrder.findFirst({
    where: {
      id: orderId,
      items: {
        some: {
          gear: {
            providerId,
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Rental order not found or you are not authorized to update it");
  }

  const updatedOrder = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status },
  });
  return updatedOrder;
};

export const ProviderService = {
  addGearIntoDB,
  updateGearInDB,
  deleteGearFromDB,
  getIncomingOrdersFromDB,
  updateOrderStatusInDB,
};

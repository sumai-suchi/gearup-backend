import { prisma } from "../../lib/prisma";
import type { UserStatus } from "../../../generated/prisma";

const createCategoryInDB = async (payload: { name: string; description?: string }) => {
  const isCategoryExists = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (isCategoryExists) {
    throw new Error("Category already exists");
  }

  const result = await prisma.category.create({
    data: payload,
  });

  return result;
};

const updateCategoryInDB = async (id: string, payload: { name?: string; description?: string }) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (payload.name) {
    const isNameExists = await prisma.category.findFirst({
      where: {
        name: payload.name,
        NOT: { id },
      },
    });
    if (isNameExists) {
      throw new Error("Category name already exists");
    }
  }

  const result = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { gears: true },
      },
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (category._count.gears > 0) {
    throw new Error("Cannot delete category with associated gears");
  }

  const result = await prisma.category.delete({
    where: { id },
  });

  return result;
};

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    omit: {
      password: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const updateUserStatusInDB = async (id: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const result = await prisma.user.update({
    where: { id },
    data: { status },
    omit: {
      password: true,
    },
  });

  return result;
};

const getAllGearFromDB = async () => {
  const result = await prisma.gearItem.findMany({
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getAllRentalsFromDB = async () => {
  const result = await prisma.rentalOrder.findMany({
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

export const AdminService = {
  createCategoryInDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllGearFromDB,
  getAllRentalsFromDB,
};

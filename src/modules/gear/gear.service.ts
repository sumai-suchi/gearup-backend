import { prisma } from "../../lib/prisma";
import type { TGearQueryFilters } from "./gear.interface";

const getAllGearFromDB = async (filters: TGearQueryFilters) => {

  const { category, brand, minPrice, maxPrice, price } = filters;
  console.log(category, brand, minPrice, maxPrice)
  const whereConditions: any = {
    isAvailable: true,
  };

  if (category) {
    whereConditions.OR = [
      { categoryId: category },
      {
        category: {
          name: {
            contains: category,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (brand) {
    whereConditions.brand = {
      contains: brand,
      mode: "insensitive",
    };
  }



  if (minPrice || maxPrice || price) {
    const priceFilter: any = {};
    if (minPrice) {
      const parsedMin = parseFloat(minPrice);
      if (!isNaN(parsedMin)) {
        priceFilter.gte = parsedMin;
      }
    }
    if (maxPrice) {
      const parsedMax = parseFloat(maxPrice);
      if (!isNaN(parsedMax)) {
        priceFilter.lte = parsedMax;
      }
    }
    if (price) {
      const parsedPrice = parseFloat(price);
      if (!isNaN(parsedPrice)) {
        priceFilter.lte = parsedPrice;
      }
    }
    if (Object.keys(priceFilter).length > 0) {
      whereConditions.pricePerDay = priceFilter;
    }
  }

  const result = await prisma.gearItem.findMany({
    where: whereConditions,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return result;
};

const getGearByIdFromDB = async (id: string) => {
  const result = await prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      reviews: {
        include: {
          customer: {
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
      },
    },
  });

  return result;
};

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          gears: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return result;
};

export const GearService = {
  getAllGearFromDB,
  getGearByIdFromDB,
  getAllCategoriesFromDB,
};

// src/app.ts
import "dotenv/config";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

// src/modules/users/users.route.ts
import { Router } from "express";

// src/modules/users/users.controller.ts
import httpStatus2 from "http-status";

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  return res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data ?? null
  });
};
var sendResponse_default = sendResponse;

// src/modules/users/users.service.ts
import bcrypt from "bcrypt";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/modules/users/users.service.ts
var registerUser = async (payload) => {
  const isUserExists = await prisma.user.findUnique({
    where: { email: payload.email }
  });
  if (isUserExists) {
    throw new Error("User already exists");
  }
  const hashedPassword = await bcrypt.hash(payload.password, parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"));
  const result = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
  return result;
};
var MyProfileDB = async (id) => {
  console.log("MyProfileDB id:", id);
  const user = await prisma.user.findUnique({
    where: { id },
    omit: {
      password: true
    }
  });
  return user;
};
var UserService = {
  registerUser,
  MyProfileDB
};

// src/modules/users/users.controller.ts
import "jsonwebtoken";

// src/utils/errorResponse.ts
var sendErrorResponse = (res, data) => {
  return res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    error: data.error,
    data: data.data ?? null
  });
};
var errorResponse_default = sendErrorResponse;

// src/utils/catch.async.ts
import httpStatus from "http-status";
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      errorResponse_default(res, {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        error: error.message,
        data: null
      });
    }
  };
};

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config_default = {
  PORT: process.env.PORT,
  db_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_expiration: process.env.JWT_ACCESS_EXPIRATION,
  jwt_refresh_expiration: process.env.JWT_REFRESH_EXPIRATION,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, expiresIn) => {
  const token = jwt.sign(
    payload,
    secret,
    expiresIn
  );
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid token");
  }
};
var JwtUtils = {
  createToken,
  verifyToken
};

// src/modules/users/users.controller.ts
var registerUser2 = catchAsync(async (req, res, next) => {
  const result = await UserService.registerUser(req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus2.CREATED,
    message: "User registered successfully",
    data: result
  });
});
var MyProfile = catchAsync(async (req, res, next) => {
  const cookie = req.cookies;
  console.log(cookie);
  const verifyedTokenn = JwtUtils.verifyToken(cookie.accessToken, config_default.jwt_access_secret);
  console.log("verifyedTokenn", verifyedTokenn);
  const user = await UserService.MyProfileDB(verifyedTokenn?.id);
  console.log(user);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus2.CREATED,
    message: "User profile retrieved successfully",
    data: user
  });
});
var userController = {
  registerUser: registerUser2,
  MyProfile
};

// src/modules/users/users.route.ts
import { Role } from "@prisma/client";

// src/midlewares/auth.ts
import httpStatus3 from "http-status";
var auth = (...requiredRoles) => {
  return catchAsync(async (req, res, next) => {
    const token = req.cookies.accesstoken ? req.cookies.accesstoken : req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization?.split(" ")[1] : req.headers.authorization;
    console.log("token", token);
    if (!token) {
      return errorResponse_default(res, {
        success: false,
        statusCode: httpStatus3.UNAUTHORIZED,
        message: "You are not authorized to access this route, Unauthorized",
        error: "You are not authorized to access this route, Unauthorized",
        data: null
      });
    }
    const verifyedTokenn = JwtUtils.verifyToken(token, config_default.jwt_access_secret);
    console.log("verifyedTokenn", verifyedTokenn);
    if (requiredRoles.length && !requiredRoles.includes(verifyedTokenn.role)) {
      return sendResponse_default(res, {
        success: false,
        statusCode: httpStatus3.FORBIDDEN,
        message: "You are not authorized to access this route, Forbidden"
      });
    }
    console.log(requiredRoles.includes(verifyedTokenn.role));
    const user = await prisma.user.findUnique({
      where: {
        id: verifyedTokenn.id
      }
    });
    console.log("user", user);
    if (!user) {
      return errorResponse_default(res, {
        success: false,
        statusCode: httpStatus3.UNAUTHORIZED,
        message: "You are not authorized to access this route, Unauthorized",
        error: "You are not authorized to access this route, Unauthorized",
        data: null
      });
    }
    if (user.status == "SUSPENDED") {
      return errorResponse_default(res, {
        success: false,
        statusCode: httpStatus3.UNAUTHORIZED,
        message: "You are not authorized to access this route, Unauthorized",
        error: "You are not authorized to access this route, Unauthorized",
        data: null
      });
    }
    if (user.role != verifyedTokenn.role) {
      return errorResponse_default(res, {
        success: false,
        statusCode: httpStatus3.UNAUTHORIZED,
        message: "You are not authorized to access this route, Unauthorized",
        error: "You are not authorized to access this route, Unauthorized",
        data: null
      });
    }
    req.user = {
      id: verifyedTokenn.id,
      name: verifyedTokenn.name,
      email: verifyedTokenn.email,
      role: verifyedTokenn.role
    };
    next();
  });
};

// src/modules/users/users.route.ts
var router = Router();
router.post("/register", userController.registerUser);
router.get("/me", auth(Role.CUSTOMER, Role.ADMIN, Role.PROVIDER), userController.MyProfile);
var userRoute = router;

// src/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/auth/auth.controller.ts
import httpStatus4 from "http-status";

// src/auth/auth.service.ts
import bcrypt2 from "bcrypt";
import "jsonwebtoken";
var loginUser = async (payload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });
  if (!user) {
    throw new Error("Invalid email or password");
  }
  const isPasswordMatched = await bcrypt2.compare(
    payload.password,
    user.password
  );
  if (!isPasswordMatched) {
    throw new Error("Invalid email or password");
  }
  const accessSecret = process.env.JWT_ACCESS_SECRET || config_default.jwt_access_secret;
  if (!accessSecret) {
    throw new Error("JWT_ACCESS_SECRET is missing");
  }
  const Payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  const accessToken = JwtUtils.createToken(Payload, config_default.jwt_access_secret, { expiresIn: config_default.jwt_access_expiration });
  const refreshToken = JwtUtils.createToken(Payload, config_default.jwt_refresh_secret, { expiresIn: config_default.jwt_refresh_expiration });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    accessToken,
    refreshToken,
    role: user.role
  };
};
var AuthService = {
  loginUser
};

// src/auth/auth.controller.ts
var loginUser2 = catchAsync(async (req, res, next) => {
  const {
    accessToken,
    refreshToken
  } = await AuthService.loginUser(req.body);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1e3
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1e3 * 7
  });
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "User logged in successfully",
    data: {
      accessToken,
      refreshToken
    }
  });
});
var authController = {
  loginUser: loginUser2
};

// src/auth/auth.route.ts
var router2 = Router2();
router2.post("/login", authController.loginUser);
var authRoute = router2;

// src/modules/provider/provider.route.ts
import { Router as Router3 } from "express";

// src/modules/provider/provider.controller.ts
import httpStatus5 from "http-status";

// src/modules/provider/provider.service.ts
var addGearIntoDB = async (providerId, payload) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.categoryId }
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
      providerId
    }
  });
  return gear;
};
var updateGearInDB = async (providerId, gearId, payload) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId }
  });
  if (!gear) {
    throw new Error("Gear item not found");
  }
  if (gear.providerId !== providerId) {
    throw new Error("You are not authorized to update this gear item");
  }
  if (payload.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: payload.categoryId }
    });
    if (!categoryExists) {
      throw new Error("Category does not exist");
    }
  }
  const updatedGear = await prisma.gearItem.update({
    where: { id: gearId },
    data: payload
  });
  return updatedGear;
};
var deleteGearFromDB = async (providerId, gearId) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId }
  });
  if (!gear) {
    throw new Error("Gear item not found");
  }
  if (gear.providerId !== providerId) {
    throw new Error("You are not authorized to delete this gear item");
  }
  const deletedGear = await prisma.gearItem.delete({
    where: { id: gearId }
  });
  return deletedGear;
};
var getIncomingOrdersFromDB = async (providerId) => {
  const orders = await prisma.rentalOrder.findMany({
    where: {
      items: {
        some: {
          gear: {
            providerId
          }
        }
      }
    },
    include: {
      items: {
        include: {
          gear: true
        }
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true
        }
      },
      payment: true
    }
  });
  return orders;
};
var updateOrderStatusInDB = async (providerId, orderId, status) => {
  const order = await prisma.rentalOrder.findFirst({
    where: {
      id: orderId,
      items: {
        some: {
          gear: {
            providerId
          }
        }
      }
    }
  });
  if (!order) {
    throw new Error("Rental order not found or you are not authorized to update it");
  }
  const updatedOrder = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status }
  });
  return updatedOrder;
};
var ProviderService = {
  addGearIntoDB,
  updateGearInDB,
  deleteGearFromDB,
  getIncomingOrdersFromDB,
  updateOrderStatusInDB
};

// src/modules/provider/provider.controller.ts
var addGear = catchAsync(async (req, res) => {
  const providerId = req.user.id;
  const result = await ProviderService.addGearIntoDB(providerId, req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus5.CREATED,
    message: "Gear item added successfully",
    data: result
  });
});
var updateGear = catchAsync(async (req, res) => {
  const providerId = req.user.id;
  const { id } = req.params;
  const result = await ProviderService.updateGearInDB(providerId, id, req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Gear item updated successfully",
    data: result
  });
});
var deleteGear = catchAsync(async (req, res) => {
  const providerId = req.user.id;
  const { id } = req.params;
  const result = await ProviderService.deleteGearFromDB(providerId, id);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Gear item deleted successfully",
    data: result
  });
});
var getIncomingOrders = catchAsync(async (req, res) => {
  const providerId = req.user.id;
  const result = await ProviderService.getIncomingOrdersFromDB(providerId);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Incoming rental orders retrieved successfully",
    data: result
  });
});
var updateOrderStatus = catchAsync(async (req, res) => {
  const providerId = req.user.id;
  const { id } = req.params;
  const { status } = req.body;
  const result = await ProviderService.updateOrderStatusInDB(providerId, id, status);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Rental order status updated successfully",
    data: result
  });
});
var providerController = {
  addGear,
  updateGear,
  deleteGear,
  getIncomingOrders,
  updateOrderStatus
};

// src/modules/provider/provider.route.ts
import { Role as Role2 } from "@prisma/client";
var router3 = Router3();
router3.post(
  "/gear",
  auth(Role2.PROVIDER),
  providerController.addGear
);
router3.put(
  "/gear/:id",
  auth(Role2.PROVIDER),
  providerController.updateGear
);
router3.delete(
  "/gear/:id",
  auth(Role2.PROVIDER),
  providerController.deleteGear
);
router3.get(
  "/orders",
  auth(Role2.PROVIDER),
  providerController.getIncomingOrders
);
router3.patch(
  "/orders/:id",
  auth(Role2.PROVIDER),
  providerController.updateOrderStatus
);
var providerRoute = router3;

// src/modules/gear/gear.route.ts
import { Router as Router4 } from "express";

// src/modules/gear/gear.controller.ts
import httpStatus6 from "http-status";

// src/modules/gear/gear.service.ts
var getAllGearFromDB = async (filters) => {
  const { category, brand, minPrice, maxPrice, price } = filters;
  console.log(category, brand, minPrice, maxPrice);
  const whereConditions = {
    isAvailable: true
  };
  if (category) {
    whereConditions.OR = [
      { categoryId: category },
      {
        category: {
          name: {
            contains: category,
            mode: "insensitive"
          }
        }
      }
    ];
  }
  if (brand) {
    whereConditions.brand = {
      contains: brand,
      mode: "insensitive"
    };
  }
  if (minPrice || maxPrice || price) {
    const priceFilter = {};
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
          name: true
        }
      },
      provider: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  return result;
};
var getGearByIdFromDB = async (id) => {
  const result = await prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
  return result;
};
var getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          gears: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });
  return result;
};
var GearService = {
  getAllGearFromDB,
  getGearByIdFromDB,
  getAllCategoriesFromDB
};

// src/modules/gear/gear.controller.ts
var getAllGear = catchAsync(async (req, res) => {
  const filters = req.query;
  const result = await GearService.getAllGearFromDB(filters);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "Gear items retrieved successfully",
    data: result
  });
});
var getGearById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GearService.getGearByIdFromDB(id);
  if (!result) {
    return errorResponse_default(res, {
      success: false,
      statusCode: httpStatus6.NOT_FOUND,
      message: "Gear item not found",
      error: "Not Found"
    });
  }
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "Gear details retrieved successfully",
    data: result
  });
});
var getAllCategories = catchAsync(async (req, res) => {
  const result = await GearService.getAllCategoriesFromDB();
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "Categories retrieved successfully",
    data: result
  });
});
var gearController = {
  getAllGear,
  getGearById,
  getAllCategories
};

// src/modules/gear/gear.route.ts
var gearRouter = Router4();
var categoryRouter = Router4();
gearRouter.get("/", gearController.getAllGear);
gearRouter.get("/:id", gearController.getGearById);
categoryRouter.get("/", gearController.getAllCategories);
var gearRoute = gearRouter;
var categoryRoute = categoryRouter;

// src/modules/admin/admin.route.ts
import { Router as Router5 } from "express";

// src/modules/admin/admin.controller.ts
import httpStatus7 from "http-status";

// src/modules/admin/admin.service.ts
var createCategoryInDB = async (payload) => {
  const isCategoryExists = await prisma.category.findUnique({
    where: { name: payload.name }
  });
  if (isCategoryExists) {
    throw new Error("Category already exists");
  }
  const result = await prisma.category.create({
    data: payload
  });
  return result;
};
var updateCategoryInDB = async (id, payload) => {
  const category = await prisma.category.findUnique({
    where: { id }
  });
  if (!category) {
    throw new Error("Category not found");
  }
  if (payload.name) {
    const isNameExists = await prisma.category.findFirst({
      where: {
        name: payload.name,
        NOT: { id }
      }
    });
    if (isNameExists) {
      throw new Error("Category name already exists");
    }
  }
  const result = await prisma.category.update({
    where: { id },
    data: payload
  });
  return result;
};
var deleteCategoryFromDB = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { gears: true }
      }
    }
  });
  if (!category) {
    throw new Error("Category not found");
  }
  if (category._count.gears > 0) {
    throw new Error("Cannot delete category with associated gears");
  }
  const result = await prisma.category.delete({
    where: { id }
  });
  return result;
};
var getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    omit: {
      password: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var updateUserStatusInDB = async (id, status) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });
  if (!user) {
    throw new Error("User not found");
  }
  const result = await prisma.user.update({
    where: { id },
    data: { status },
    omit: {
      password: true
    }
  });
  return result;
};
var getAllGearFromDB2 = async () => {
  const result = await prisma.gearItem.findMany({
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var getAllRentalsFromDB = async () => {
  const result = await prisma.rentalOrder.findMany({
    include: {
      items: {
        include: {
          gear: true
        }
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      payment: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var AdminService = {
  createCategoryInDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllGearFromDB: getAllGearFromDB2,
  getAllRentalsFromDB
};

// src/modules/admin/admin.controller.ts
var createCategory = catchAsync(async (req, res) => {
  const result = await AdminService.createCategoryInDB(req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus7.CREATED,
    message: "Category created successfully",
    data: result
  });
});
var updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.updateCategoryInDB(id, req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "Category updated successfully",
    data: result
  });
});
var deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.deleteCategoryFromDB(id);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "Category deleted successfully",
    data: result
  });
});
var getAllUsers = catchAsync(async (req, res) => {
  const result = await AdminService.getAllUsersFromDB();
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "All users retrieved successfully",
    data: result
  });
});
var updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await AdminService.updateUserStatusInDB(id, status);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "User status updated successfully",
    data: result
  });
});
var getAllGear2 = catchAsync(async (req, res) => {
  const result = await AdminService.getAllGearFromDB();
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "All gear listings retrieved successfully",
    data: result
  });
});
var getAllRentals = catchAsync(async (req, res) => {
  const result = await AdminService.getAllRentalsFromDB();
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "All rental orders retrieved successfully",
    data: result
  });
});
var adminController = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllUsers,
  updateUserStatus,
  getAllGear: getAllGear2,
  getAllRentals
};

// src/modules/admin/admin.route.ts
import { Role as Role3 } from "@prisma/client";
var router4 = Router5();
router4.post("/categories", auth(Role3.ADMIN), adminController.createCategory);
router4.put("/categories/:id", auth(Role3.ADMIN), adminController.updateCategory);
router4.delete("/categories/:id", auth(Role3.ADMIN), adminController.deleteCategory);
router4.get("/users", auth(Role3.ADMIN), adminController.getAllUsers);
router4.patch("/users/:id", auth(Role3.ADMIN), adminController.updateUserStatus);
router4.get("/gear", auth(Role3.ADMIN), adminController.getAllGear);
router4.get("/rentals", auth(Role3.ADMIN), adminController.getAllRentals);
var adminRoute = router4;

// src/modules/rentals/rentals.route.ts
import { Router as Router6 } from "express";

// src/modules/rentals/rentals.controller.ts
import httpStatus8 from "http-status";

// src/modules/rentals/rentals.service.ts
var createRentalOrderInDB = async (customerId, payload) => {
  console.log(customerId, "createRentalOrderInDB payload:", payload);
  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid start date or end date format");
  }
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24));
  if (totalDays <= 0) {
    throw new Error("End date must be after start date");
  }
  if (!payload.items || payload.items.length === 0) {
    throw new Error("Rental order must contain at least one gear item");
  }
  const gearIds = payload.items.map((i) => i.gearId);
  const gears = await prisma.gearItem.findMany({
    where: {
      id: { in: gearIds }
    }
  });
  if (gears.length !== gearIds.length) {
    throw new Error("One or more gear items in the order were not found");
  }
  const gearMap = new Map(gears.map((g) => [g.id, g]));
  let totalAmount = 0;
  const orderItemsData = [];
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
      pricePerDay: gear.pricePerDay
    });
  }
  const result = await prisma.$transaction(async (tx) => {
    for (const item of payload.items) {
      const gear = gearMap.get(item.gearId);
      const newStock = gear.stock - item.quantity;
      await tx.gearItem.update({
        where: { id: item.gearId },
        data: {
          stock: newStock,
          isAvailable: newStock > 0
        }
      });
    }
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
            pricePerDay: item.pricePerDay
          }))
        }
      },
      include: {
        items: {
          include: {
            gear: true
          }
        }
      }
    });
    return order;
  });
  return result;
};
var getUserRentalsFromDB = async (customerId) => {
  const result = await prisma.rentalOrder.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          gear: true
        }
      },
      payment: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var getRentalByIdFromDB = async (customerId, orderId, userRole) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          gear: true
        }
      },
      payment: true
    }
  });
  if (!order) {
    throw new Error("Rental order not found");
  }
  if (userRole !== "ADMIN" && order.customerId !== customerId) {
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
var RentalService = {
  createRentalOrderInDB,
  getUserRentalsFromDB,
  getRentalByIdFromDB
};

// src/modules/rentals/rentals.controller.ts
var createRentalOrder = catchAsync(async (req, res) => {
  const customerId = req.user.id;
  console.log("customerId", customerId);
  console.log(req.body);
  const result = await RentalService.createRentalOrderInDB(customerId, req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus8.CREATED,
    message: "Rental order placed successfully",
    data: result
  });
});
var getUserRentals = catchAsync(async (req, res) => {
  const customerId = req.user.id;
  const result = await RentalService.getUserRentalsFromDB(customerId);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus8.OK,
    message: "Rental orders retrieved successfully",
    data: result
  });
});
var getRentalById = catchAsync(async (req, res) => {
  const customerId = req.user.id;
  const userRole = req.user.role;
  const { id } = req.params;
  const result = await RentalService.getRentalByIdFromDB(customerId, id, userRole);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus8.OK,
    message: "Rental order details retrieved successfully",
    data: result
  });
});
var rentalsController = {
  createRentalOrder,
  getUserRentals,
  getRentalById
};

// src/modules/rentals/rentals.route.ts
import { Role as Role4 } from "@prisma/client";
var router5 = Router6();
router5.post("/", auth(Role4.CUSTOMER), rentalsController.createRentalOrder);
router5.get("/", auth(Role4.CUSTOMER, Role4.PROVIDER, Role4.ADMIN), rentalsController.getUserRentals);
router5.get("/:id", auth(Role4.CUSTOMER, Role4.PROVIDER, Role4.ADMIN), rentalsController.getRentalById);
var rentalRoute = router5;

// src/modules/payments/payments.route.ts
import { Router as Router7 } from "express";

// src/modules/payments/payments.controller.ts
import httpStatus9 from "http-status";

// src/modules/payments/payments.service.ts
import Stripe from "stripe";
import { PaymentStatus, RentalStatus } from "@prisma/client";
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});
var createPaymentIntentInDB = async (customerId, rentalOrderId) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: { payment: true }
  });
  if (!rentalOrder) {
    throw new Error("Rental order not found");
  }
  if (rentalOrder.customerId !== customerId) {
    throw new Error("You are not authorized to pay for this rental order");
  }
  if (rentalOrder.status === RentalStatus.CANCELLED) {
    throw new Error("Cannot pay for a cancelled rental order");
  }
  if (rentalOrder.payment) {
    if (rentalOrder.payment.status === PaymentStatus.COMPLETED) {
      throw new Error("Payment already completed for this order");
    }
    return {
      clientSecret: rentalOrder.payment.paymentIntentId,
      payment: rentalOrder.payment
    };
  }
  const amountInCents = Math.round(rentalOrder.totalAmount * 100);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: {
      rentalOrderId,
      customerId
    }
  });
  const payment = await prisma.payment.create({
    data: {
      rentalOrderId,
      customerId,
      amount: rentalOrder.totalAmount,
      paymentIntentId: paymentIntent.client_secret,
      status: PaymentStatus.PENDING
    }
  });
  return {
    clientSecret: paymentIntent.client_secret,
    payment
  };
};
var confirmPaymentInDB = async (paymentIntentId, transactionId) => {
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { paymentIntentId },
        { paymentIntentId: { contains: paymentIntentId } }
      ]
    }
  });
  if (!payment) {
    throw new Error("Payment record not found");
  }
  if (payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: transactionId || `txn_${Math.random().toString(36).substring(2, 11)}`,
        paidAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.rentalOrder.update({
      where: { id: payment.rentalOrderId },
      data: {
        status: RentalStatus.PAID
      }
    });
    return updatedPayment;
  });
  return result;
};
var getUserPaymentHistoryFromDB = async (customerId) => {
  const result = await prisma.payment.findMany({
    where: { customerId },
    include: {
      rentalOrder: {
        include: {
          items: {
            include: {
              gear: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var getPaymentDetailsFromDB = async (customerId, paymentId, userRole) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      rentalOrder: {
        include: {
          items: {
            include: {
              gear: true
            }
          }
        }
      }
    }
  });
  if (!payment) {
    throw new Error("Payment record not found");
  }
  if (userRole !== "ADMIN" && payment.customerId !== customerId) {
    throw new Error("You are not authorized to view this payment details");
  }
  return payment;
};
var PaymentService = {
  createPaymentIntentInDB,
  confirmPaymentInDB,
  getUserPaymentHistoryFromDB,
  getPaymentDetailsFromDB
};

// src/modules/payments/payments.controller.ts
var createPaymentIntent = catchAsync(async (req, res) => {
  const customerId = req.user.id;
  const { rentalOrderId } = req.body;
  if (!rentalOrderId) {
    throw new Error("rentalOrderId is required in request body");
  }
  const result = await PaymentService.createPaymentIntentInDB(customerId, rentalOrderId);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus9.CREATED,
    message: "Payment intent created successfully",
    data: result
  });
});
var confirmPayment = catchAsync(async (req, res) => {
  let paymentIntentId = req.body.paymentIntentId;
  let transactionId = req.body.transactionId;
  if (req.body && req.body.type) {
    const event = req.body;
    if (event.type === "payment_intent.succeeded") {
      const paymentIntentObj = event.data.object;
      paymentIntentId = paymentIntentObj.client_secret || paymentIntentObj.id;
      transactionId = paymentIntentObj.id;
    } else {
      return sendResponse_default(res, {
        success: true,
        statusCode: httpStatus9.OK,
        message: `Webhook event "${event.type}" acknowledged, no updates needed`,
        data: null
      });
    }
  }
  if (!paymentIntentId) {
    throw new Error("paymentIntentId is required to confirm payment");
  }
  const result = await PaymentService.confirmPaymentInDB(paymentIntentId, transactionId);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: "Payment confirmed successfully",
    data: result
  });
});
var getUserPaymentHistory = catchAsync(async (req, res) => {
  const customerId = req.user.id;
  const result = await PaymentService.getUserPaymentHistoryFromDB(customerId);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: "Payment history retrieved successfully",
    data: result
  });
});
var getPaymentDetails = catchAsync(async (req, res) => {
  const customerId = req.user.id;
  const userRole = req.user.role;
  const { id } = req.params;
  const result = await PaymentService.getPaymentDetailsFromDB(customerId, id, userRole);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: "Payment details retrieved successfully",
    data: result
  });
});
var paymentsController = {
  createPaymentIntent,
  confirmPayment,
  getUserPaymentHistory,
  getPaymentDetails
};

// src/modules/payments/payments.route.ts
import { Role as Role5 } from "@prisma/client";
var router6 = Router7();
router6.post("/create", auth(Role5.CUSTOMER), paymentsController.createPaymentIntent);
router6.post("/confirm", paymentsController.confirmPayment);
router6.get("/", auth(Role5.CUSTOMER), paymentsController.getUserPaymentHistory);
router6.get("/:id", auth(Role5.CUSTOMER, Role5.ADMIN), paymentsController.getPaymentDetails);
var paymentRoute = router6;

// src/modules/reviews/reviews.route.ts
import { Router as Router8 } from "express";

// src/modules/reviews/reviews.controller.ts
import httpStatus10 from "http-status";

// src/modules/reviews/reviews.service.ts
var createReviewInDB = async (customerId, payload) => {
  const { gearId, rating, comment } = payload;
  if (!gearId || rating === void 0 || !comment) {
    throw new Error("gearId, rating, and comment are required");
  }
  const parsedRating = Number(rating);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    throw new Error("Rating must be a number between 1 and 5");
  }
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId }
  });
  if (!gear) {
    throw new Error("Gear item not found");
  }
  const existingReview = await prisma.review.findUnique({
    where: {
      customerId_gearId: {
        customerId,
        gearId
      }
    }
  });
  if (existingReview) {
    throw new Error("You have already reviewed this gear item");
  }
  const result = await prisma.review.create({
    data: {
      customerId,
      gearId,
      rating: parsedRating,
      comment
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      gear: true
    }
  });
  return result;
};
var getReviewsByGearIdFromDB = async (gearId) => {
  const result = await prisma.review.findMany({
    where: { gearId },
    include: {
      customer: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var getUserReviewsFromDB = async (customerId) => {
  const result = await prisma.review.findMany({
    where: { customerId },
    include: {
      gear: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var deleteReviewFromDB = async (customerId, reviewId, role) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });
  if (!review) {
    throw new Error("Review not found");
  }
  if (role !== "ADMIN" && review.customerId !== customerId) {
    throw new Error("You are not authorized to delete this review");
  }
  const result = await prisma.review.delete({
    where: { id: reviewId }
  });
  return result;
};
var ReviewService = {
  createReviewInDB,
  getReviewsByGearIdFromDB,
  getUserReviewsFromDB,
  deleteReviewFromDB
};

// src/modules/reviews/reviews.controller.ts
var createReview = catchAsync(async (req, res) => {
  const customerId = req.user.id;
  const result = await ReviewService.createReviewInDB(customerId, req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus10.CREATED,
    message: "Review added successfully",
    data: result
  });
});
var getReviewsByGearId = catchAsync(async (req, res) => {
  const { gearId } = req.params;
  const result = await ReviewService.getReviewsByGearIdFromDB(gearId);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus10.OK,
    message: "Reviews retrieved successfully",
    data: result
  });
});
var getUserReviews = catchAsync(async (req, res) => {
  const customerId = req.user.id;
  const result = await ReviewService.getUserReviewsFromDB(customerId);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus10.OK,
    message: "Your reviews retrieved successfully",
    data: result
  });
});
var deleteReview = catchAsync(async (req, res) => {
  const customerId = req.user.id;
  const role = req.user.role;
  const { id } = req.params;
  const result = await ReviewService.deleteReviewFromDB(customerId, id, role);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus10.OK,
    message: "Review deleted successfully",
    data: result
  });
});
var reviewsController = {
  createReview,
  getReviewsByGearId,
  getUserReviews,
  deleteReview
};

// src/modules/reviews/reviews.route.ts
import { Role as Role6 } from "@prisma/client";
var router7 = Router8();
router7.post("/", auth(Role6.CUSTOMER), reviewsController.createReview);
router7.get("/my-reviews", auth(Role6.CUSTOMER), reviewsController.getUserReviews);
router7.get("/gear/:gearId", reviewsController.getReviewsByGearId);
router7.delete("/:id", auth(Role6.CUSTOMER, Role6.ADMIN), reviewsController.deleteReview);
var reviewRoute = router7;

// src/app.ts
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/provider", providerRoute);
app.use("/api/gear", gearRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/admin", adminRoute);
app.use("/api/rentals", rentalRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/reviews", reviewRoute);
var app_default = app;
export {
  app_default as default
};

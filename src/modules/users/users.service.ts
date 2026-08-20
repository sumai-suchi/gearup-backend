import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import type { TLoginUser, TRegisterUser } from "./users.interface";


const registerUser = async (payload : TRegisterUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: { email: payload.email },
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
     role: payload.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
    
      role: true,
      createdAt: true,
    },
  });

  return result;
};

const loginUser = async (payload: TLoginUser) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isPasswordMatched) {
    throw new Error("Invalid email or password");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
   
    role: user.role,
  };
};

export const UserService = {
  registerUser,
  loginUser,
};
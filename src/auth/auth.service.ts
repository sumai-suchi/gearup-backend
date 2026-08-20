import { prisma } from "../lib/prisma";
import type { TLoginUser } from "./auth.interface";
import bcrypt from "bcrypt";

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

export const AuthService = {
  loginUser,
};

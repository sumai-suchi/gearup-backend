
import config from "../config";
import { prisma } from "../lib/prisma";
import type { TLoginUser } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import {JwtUtils} from "../utils/jwt";

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

  const accessSecret = process.env.JWT_ACCESS_SECRET || config.jwt_access_secret ;
  if (!accessSecret) {
    throw new Error("JWT_ACCESS_SECRET is missing");
  }

  const Payload = {
    id: user.id,
    email: user.email,
   name: user.name,
    role: user.role,
  }


const accessToken = JwtUtils.createToken(Payload, config.jwt_access_secret, { expiresIn: config.jwt_access_expiration } as SignOptions);

  const refreshToken = JwtUtils.createToken(Payload, config.jwt_refresh_secret, { expiresIn: config.jwt_refresh_expiration } as SignOptions);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    accessToken,
    refreshToken,
    role: user.role,
  };
};


export const AuthService = {
  loginUser,
 
};

import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import type {  TRegisterUser } from "./users.interface";


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

const MyProfileDB = async (id: string) => {
  console.log("MyProfileDB id:", id);
  const user = await prisma.user.findUnique({
    where: { id: id },
   omit: {
    password: true,
   },
  

  });

  return user;
};



export const UserService = {
  registerUser,
 MyProfileDB
  
};
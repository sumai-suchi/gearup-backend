export type TRegisterUser = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
};

export type TLoginUser = {
  email: string;
  password: string;
};
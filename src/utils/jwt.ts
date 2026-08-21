import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const createToken = (payload : JwtPayload, secret: string, expiresIn: SignOptions) => {

    const token= jwt.sign(payload, secret, 
        
        expiresIn
        );
  return token
}

const verifyToken = (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded;
    } catch (error) {
        console.error("Token verification failed:", error);
        throw new Error("Invalid token");
    }
};
export const JwtUtils = {
    createToken,
    verifyToken
}
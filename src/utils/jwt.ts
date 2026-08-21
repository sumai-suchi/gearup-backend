import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const createToken = (payload : JwtPayload, secret: string, expiresIn: SignOptions) => {

    const token= jwt.sign(payload, secret, 
        
        expiresIn
        );
  return token
}

export const JwtUtils = {
    createToken
}
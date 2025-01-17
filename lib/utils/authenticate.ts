import jwt from 'jsonwebtoken';
import { NextRequest } from "next/server";

export interface DecodedToken {
    userId: string;
    iat: number;
    exp: number;
}

const authenticate = (request: NextRequest): DecodedToken | string => {
    try {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        if (!token) throw new Error("No token found");

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        return decoded;
    } catch (error) {
        return "Invalid or expired token";
    }
};

export default authenticate;

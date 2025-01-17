import { jwtVerify } from 'jose';
import { NextRequest } from "next/server";

const validateToken = async (token: string | undefined) => {
    if (!token) {
        return false;
    }
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret'));
        console.log("Decoded JWT:", payload);
        return true;
    } catch (error) {
        console.error("Token validation failed:", error);
        return false;
    }
};

export function authMiddleware(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    const isValid = validateToken(token);

    if (!isValid) {
        console.log("Token validation failed. Returning Unauthorized response.");
        return new Response("Unauthorized: Invalid Authentication", { status: 401 });
    }

    return null;
}

export const config = {
    matcher: "/api/:path*",
};

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "./middlewares/apis/authMiddleware";
import { loginMiddleware } from "./middlewares/apis/loginMiddleware";

export const config = {
    matcher: "/api/:path*",
};

const publicPaths = [
    "/api/auth/register",
    "/api/auth/login",
    "/docs"
];

export default function middleware(request: NextRequest) {
    const isPublicPath = publicPaths.some((path) => request.url.includes(path));
    if (isPublicPath) {
        return NextResponse.next();
    }

    const logResult = loginMiddleware(request);
    if (logResult) {
        return logResult;
    }

    const authResult = authMiddleware(request);
    if (authResult) {
        return authResult;
    }

    return NextResponse.next();
}

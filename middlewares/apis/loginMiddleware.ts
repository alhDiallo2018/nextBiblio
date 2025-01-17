import { NextRequest } from "next/server";

export function loginMiddleware(request: NextRequest) {
    const validMethods = ["GET","POST", "PUT", "DELETE", "PATCH"];
    const isValidRequest = validMethods.includes(request.method);

    if (isValidRequest) {
        return null; 
    }

    return new Response("Unauthorized: Invalid Login", { status: 401 });
}

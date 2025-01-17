import connect from "@/lib/db";
import Book from "@/lib/models/book";
import User from "@/lib/models/user";
import authenticate, { DecodedToken } from "@/lib/utils/authenticate";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         comment:
 *           type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *     Book:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         publishedDate:
 *           type: string
 *           format: date
 *         category:
 *           type: string
 *         rating:
 *           type: number
 *           minimum: 0
 *         reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 *         userId:
 *           type: string
 * 
 * /book:
 *   post:
 *     summary: Create a new book
 *     description: This endpoint allows users to create a new book with reviews.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User or book not found
 *       500:
 *         description: Internal server error
 */

export const DELETE = async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const bookId = searchParams.get("bookId");
        const decoded = authenticate(request);
        
        if (!decoded || typeof decoded === "string" || !decoded.userId) {
            return NextResponse.json(
                { message: "Authentication failed or invalid token." },
                { status: 401 }
            );
        }

        if ((decoded as DecodedToken).userId !== userId) {
            return NextResponse.json(
                { message: "You are not authorized to update another user's information." },
                { status: 403 }
            );
        }


        if (!bookId || !Types.ObjectId.isValid(bookId)) {
            return NextResponse.json(
                { message: "Invalid or missing bookId" },
                { status: 400 }
            );
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { message: "Invalid or missing userId" },
                { status: 400 }
            );
        }

        await connect();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Suppression du livre
        const deletedBook = await Book.findByIdAndDelete(bookId);
        if (!deletedBook) {
            return NextResponse.json(
                { message: "Book not found" },
                { status: 404 }
            );
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting book:", error);
        return NextResponse.json(
            {
                message: "Error deleting book",
                error: error || "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
};

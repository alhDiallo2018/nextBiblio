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
 *     Book:
 *       type: object
 *       properties:
 *         bookId:
 *           type: string
 *         author:
 *           type: string
 *         title:
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
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               comment:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 * /book:
 *   patch:
 *     summary: Update an existing book
 *     description: This endpoint allows users to update an existing book's details such as title, author, published date, category, rating, and reviews.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: book
 *         description: The book details to be updated.
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
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
 *         description: Invalid or missing bookId or userId
 *       401:
 *         description: Authentication failed or invalid token
 *       403:
 *         description: Forbidden: You are not authorized to update another user's information
 *       404:
 *         description: Book or user not found
 *       500:
 *         description: Internal server error
 */
export const PATCH = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { bookId, author, title, publishedDate, category, rating, reviews } = body;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
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
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing bookId" }),
                { status: 400 }
            );
        }

        await connect();

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "User not found" }),
                { status: 404 }
            );
        }

        // Mise à jour du livre
        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { $set: { author, title, publishedDate, category, rating, reviews } },
            { new: true }
        );

        if (!updatedBook) {
            return new NextResponse(
                JSON.stringify({ message: "Book not found" }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: "Book updated", book: updatedBook }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating book:", error);
        return new NextResponse(
            JSON.stringify({ message: "Error updating book", error }),
            { status: 500 }
        );
    }
};


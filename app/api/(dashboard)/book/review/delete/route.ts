import connect from "@/lib/db";
import Book from "@/lib/models/book";
import authenticate, { DecodedToken } from "@/lib/utils/authenticate";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /books/rating:
 *   delete:
 *     summary: Remove a comment and rating from a book
 *     description: This endpoint allows a user to remove their comment and rating for a specific book.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: The unique identifier of the user removing the comment and rating.
 *       - in: query
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *           description: The unique identifier of the book from which the comment and rating are to be removed.
 *     responses:
 *       200:
 *         description: The comment and rating were successfully removed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message.
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid input (missing userId/bookId or no reviews found).
 *       401:
 *         description: Authentication failed or invalid token.
 *       403:
 *         description: User is not authorized to update another user's information.
 *       404:
 *         description: The specified book or comment was not found.
 *       500:
 *         description: Internal server error.
 */
// Supprimer un commentaire/note
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
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing bookId" }),
                { status: 400 }
            );
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId" }),
                { status: 400 }
            );
        }

        await connect();

        const book = await Book.findById(bookId);
        if (!book) {
            return new NextResponse(
                JSON.stringify({ message: "Book not found" }),
                { status: 404 }
            );
        }

        if (!Array.isArray(book.reviews)) {
            return new NextResponse(
                JSON.stringify({ message: "No reviews to delete" }),
                { status: 400 }
            );
        }

        // Trouver l'index du commentaire à supprimer
        const commentIndex = book.reviews.findIndex(
            (c: { userId: Types.ObjectId }) => c.userId.toString() === userId
        );

        if (commentIndex === -1) {
            return new NextResponse(
                JSON.stringify({ message: "Comment not found" }),
                { status: 404 }
            );
        }

        // Supprimer le commentaire
        book.reviews.splice(commentIndex, 1);

        // Sauvegarder les modifications
        await book.save();

        return new NextResponse(
            JSON.stringify({ message: "Comment successfully deleted", book }),
            { status: 200 }
        );
    } catch (error) {
        console.log("Error deleting comment and rating:", error);
        return new NextResponse(
            JSON.stringify({ message: "Internal Server Error" }),
            { status: 500 }
        );
    }
};

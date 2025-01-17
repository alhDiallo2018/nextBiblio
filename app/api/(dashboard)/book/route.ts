import connect from "@/lib/db";
import Book from "@/lib/models/book";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
/**
 * @swagger
 * /books/all:
 *   get:
 *     summary: Get all books
 *     description: This endpoint retrieves all books from the database.
 *     responses:
 *       200:
 *         description: A list of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get books for a specific user
 *     description: This endpoint retrieves books associated with a specific user based on their `userId`.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: The unique identifier for the user whose books are being retrieved.
 *     responses:
 *       200:
 *         description: A list of books for the specified user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid or missing userId
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */


export const GETAfficherTousLesLivres = async () => {
    try {
        await connect();

        // Récupérer tous les livres
        const books = await Book.find();
        return NextResponse.json(books, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération des livres :", error);
        return NextResponse.json(
            { message: "Erreur lors de la récupération des livres", error },
            { status: 500 }
        );
    }
};

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

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

        const books = await Book.find({ userId: new Types.ObjectId(userId) });
        return NextResponse.json(books, { status: 200 });
    } catch (error) {
        console.error("Error fetching books:", error);
        return NextResponse.json(
            { message: "Error fetching books" },
            { status: 500 }
        );
    }
};


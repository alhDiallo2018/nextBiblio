import connect from "@/lib/db";
import Book from "@/lib/models/book";
import User from "@/lib/models/user";
import authenticate, { DecodedToken } from "@/lib/utils/authenticate";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
/**
 * @swagger
 * /books/rating:
 *   patch:
 *     summary: Modify a comment and rating for a book
 *     description: This endpoint allows a user to modify their comment and rating for a specific book.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: The unique identifier of the user modifying the comment and rating.
 *       - in: query
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *           description: The unique identifier of the book whose comment and rating are to be modified.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: The comment to update for the book.
 *               rating:
 *                 type: integer
 *                 description: The rating to update for the book (between 1 and 5).
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: The comment and rating were successfully updated.
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
 *         description: Invalid input (invalid rating, missing comment, or missing userId/bookId).
 *       401:
 *         description: Authentication failed or invalid token.
 *       403:
 *         description: User is not authorized to update another user's information.
 *       404:
 *         description: The specified book or comment was not found.
 *       500:
 *         description: Internal server error.
 */
// Fonction utilitaire pour valider et récupérer les entités User et Book
const validateAndGetEntities = async (userId: string, bookId: string) => {
    // Vérification de la validité des IDs
    if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid or missing userId");
    }
    if (!bookId || !Types.ObjectId.isValid(bookId)) {
        throw new Error("Invalid or missing bookId");
    }

    // Connexion à la base de données
    await connect();

    // Recherche de l'utilisateur et du livre
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const book = await Book.findById(bookId);
    if (!book) {
        throw new Error("Book not found");
    }

    return { user, book };
};

// Modifier un commentaire/note
export const PATCH = async (request: NextRequest) => {
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

        // Vérification si userId et bookId ne sont pas null
        if (!userId || !bookId) {
            return new NextResponse(
                JSON.stringify({ message: "userId and bookId are required" }),
                { status: 400 }
            );
        }

        const body = await request.json();
        const { comment, rating } = body;

        // Validation des entités
        const { user, book } = await validateAndGetEntities(userId, bookId);

        // Vérification de la note
        if (rating < 1 || rating > 5) {
            return new NextResponse(
                JSON.stringify({ message: "Rating must be between 1 and 5" }),
                { status: 400 }
            );
        }

        // Initialisation du tableau de commentaires si nécessaire
        if (!Array.isArray(book.reviews)) {
            book.reviews = []; // Initialiser reviews si c'est undefined
        }

        // Vérifier si l'utilisateur a déjà laissé un commentaire
        const existingComment = book.reviews.find(
            (c: { userId: Types.ObjectId }) => c.userId.toString() === userId
        );

        if (!existingComment) {
            return new NextResponse(
                JSON.stringify({ message: "Comment not found" }),
                { status: 404 }
            );
        }

        // Mettre à jour le commentaire et la note
        existingComment.comment = comment || existingComment.comment;
        existingComment.rating = rating || existingComment.rating;

        // Sauvegarder les modifications du livre
        await book.save();

        return new NextResponse(
            JSON.stringify({
                message: "Comment and rating successfully updated",
                book,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating comment and rating:", error);
        return new NextResponse(
            JSON.stringify({
                message: error instanceof Error ? error.message : "Internal Server Error",
            }),
            { status: 500 }
        );
    }
};

import connect from "@/lib/db";
import Book from "@/lib/models/book";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const bookId = searchParams.get("bookId");
        const body = await request.json();
        const { comment, rating } = body;

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

        if (rating < 1 || rating > 5) {
            return new NextResponse(
                JSON.stringify({ message: "Rating must be between 1 and 5" }),
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

        const book = await Book.findById(bookId);
        if (!book) {
            return new NextResponse(
                JSON.stringify({ message: "Book not found" }),
                { status: 404 }
            );
        }

        if (!Array.isArray(book.reviews)) {
            book.reviews = []; // Initialiser reviews si c'est undefined
        }

        // Vérifier si l'utilisateur a déjà laissé un commentaire
        const existingComment = book.reviews.find(
            (c: { userId: Types.ObjectId }) => c.userId.toString() === userId
        );

        if (existingComment) {
            // Mettre à jour le commentaire et la note
            existingComment.comment = comment || existingComment.comment;
            existingComment.rating = rating || existingComment.rating;
        } else {
            // Ajouter un nouveau commentaire et une note
            book.reviews.push({
                comment,
                rating,
                userId: new Types.ObjectId(userId),  // Utiliser 'userId' ici
            });
        }

        // Sauvegarder les modifications du livre
        await book.save();

        return new NextResponse(
            JSON.stringify({
                message: existingComment
                    ? "Comment and rating successfully updated"
                    : "Comment and rating successfully added",
                book,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.log("Error adding or updating comment and rating:", error);
        return new NextResponse(
            JSON.stringify({ message: "Internal Server Error" }),
            { status: 500 }
        );
    }
};

import { NextResponse } from "next/server";

import connect from "@/lib/db";
import Book from "@/lib/models/book";
import User from "@/lib/models/user";
import { Types } from "mongoose";

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


        const books = await Book.find({ user: new Types.ObjectId(userId) });
        return NextResponse.json(books, { status: 200 });
    } catch (error) {
        console.error("Error fetching books:", error);
        return NextResponse.json(
            { message: "Error fetching books:" },
            { status: 500 }
        );
    }
};

export const POST = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        const body = await request.json();
        const { title, author, publishedDate, category, rating, reviews } = body;

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
        const newBook = new Book({
            title,
            author,
            publishedDate,
            category,
            rating,
            reviews,
            user: new Types.ObjectId(userId),
        });
        await newBook.save();
        return new NextResponse(
            JSON.stringify({ message: "Book created", book: newBook }),
            { status: 201 }
        );
    } catch (error) {
        return new NextResponse(
            JSON.stringify({ message: "Error creating book", error }),
            { status: 500 }
        )
    }
};

export const PATCH = async (request: Request) => {
    try {
        const body = await request.json();
        const { bookId, author, title, publishedDate, category, rating, reviews, } = body;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

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
        )
    } catch (error) {

    }

};

export const DELETE = async (request: Request) => {
    try {
        // Extraire les paramètres de la requête
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const bookId = searchParams.get("bookId");

        // Vérification des paramètres
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
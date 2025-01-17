import connect from "@/lib/db";
import Book from "@/lib/models/book";
import authenticate, { DecodedToken } from "@/lib/utils/authenticate";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         category:
 *           type: string
 *         publishedDate:
 *           type: string
 *           format: date
 *         rating:
 *           type: number
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
 * /books:
 *   get:
 *     summary: Search and sort books based on various parameters
 *     description: This endpoint allows users to search for books by title, author, and category, and to sort the results based on specified criteria.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: title
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: author
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           default: "publishedDate"
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "asc"
 *     responses:
 *       200:
 *         description: Books found based on search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid or missing query parameters
 *       401:
 *         description: Authentication failed or invalid token
 *       403:
 *         description: Forbidden: You are not authorized to access another user's information
 *       500:
 *         description: Internal server error
 */
export const GET = async (request: NextRequest) => {
    try {
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

        // Récupération des paramètres de recherche
        const title = searchParams.get("title") || "";
        const author = searchParams.get("author") || "";
        const category = searchParams.get("category") || "";

        // Récupération des paramètres de tri
        const sortBy = searchParams.get("sortBy") || "publishedDate"; 
        const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1; 

        // Connexion à la base de données
        await connect();

        // Construction du filtre
        const filter: any = {};

        if (title) filter.title = { $regex: title, $options: "i" }; 
        if (author) filter.author = { $regex: author, $options: "i" }; 
        if (category) filter.category = { $regex: category, $options: "i" }; 

        // Récupération des livres en fonction des critères de recherche et de tri
        const books = await Book.find(filter)
            .sort({ [sortBy]: sortOrder }) 
            .exec();

        return new NextResponse(
            JSON.stringify({ message: "Livres trouvés", books }),   
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur lors de la recherche des livres:", error);
        return new NextResponse(
            JSON.stringify({ message: "Erreur lors de la recherche des livres.", error: error }),
            { status: 500 }
        );
    }
};

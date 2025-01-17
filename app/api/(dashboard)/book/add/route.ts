import connect from "@/lib/db";
import Book from "@/lib/models/book";
import User from "@/lib/models/user";
import authenticate, { DecodedToken } from "@/lib/utils/authenticate";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Créer un nouveau livre
 *     description: Permet de créer un nouveau livre avec des informations comme le titre, l'auteur, la date de publication, la catégorie, et des critiques (reviews).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 description: Le titre du livre.
 *                 example: "Les Misérables"
 *               author:
 *                 type: string
 *                 description: L'auteur du livre.
 *                 example: "Victor Hugo"
 *               publishedDate:
 *                 type: string
 *                 format: date
 *                 description: La date de publication du livre.
 *                 example: "1862-01-01"
 *               category:
 *                 type: string
 *                 description: La catégorie du livre.
 *                 example: "Roman"
 *               rating:
 *                 type: number
 *                 format: float
 *                 description: La note moyenne du livre.
 *                 example: 4.5
 *               reviews:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: L'identifiant de l'utilisateur qui a écrit la critique.
 *                       example: "60a7b88fa9a19c001f1b2f5d"
 *                     comment:
 *                       type: string
 *                       description: Le commentaire de la critique.
 *                       example: "Un livre exceptionnel!"
 *                     rating:
 *                       type: integer
 *                       description: La note de la critique, comprise entre 1 et 5.
 *                       example: 5
 *     responses:
 *       201:
 *         description: Livre créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Livre créé avec succès."
 *                 book:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60a7b88fa9a19c001f1b2f5d"
 *                     title:
 *                       type: string
 *                       example: "Les Misérables"
 *                     author:
 *                       type: string
 *                       example: "Victor Hugo"
 *                     publishedDate:
 *                       type: string
 *                       format: date
 *                       example: "1862-01-01"
 *                     category:
 *                       type: string
 *                       example: "Roman"
 *                     rating:
 *                       type: number
 *                       example: 4.5
 *                     reviews:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "60a7b88fa9a19c001f1b2f5d"
 *                           comment:
 *                             type: string
 *                             example: "Un livre exceptionnel!"
 *                           rating:
 *                             type: integer
 *                             example: 5
 *       400:
 *         description: Erreur de validation des champs (title, author, reviews).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Les champs 'title' et 'author' sont obligatoires."
 *       401:
 *         description: Authentification échouée ou token invalide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication failed or invalid token."
 *       403:
 *         description: L'utilisateur n'est pas autorisé à mettre à jour les informations d'un autre utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to update another user's information."
 *       404:
 *         description: Utilisateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur non trouvé."
 *       500:
 *         description: Erreur interne du serveur lors de la création du livre.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la création du livre."
 *                 error:
 *                   type: object
 *                   example: "Error details"
 */

// Interface pour la structure de review
interface Review {
    userId: string;
    comment: string;
    rating: number;
}
export const POST = async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const body = await request.json();
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

        const { title, author, publishedDate, category, rating, reviews } = body;

        // Validation des champs requis
        if (!title || !author) {
            return NextResponse.json(
                { message: "Les champs 'title' et 'author' sont obligatoires." },
                { status: 400 }
            );
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { message: "L'identifiant 'userId' est invalide ou manquant." },
                { status: 400 }
            );
        }

        await connect();

        // Vérification de l'existence de l'utilisateur
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { message: "Utilisateur non trouvé." },
                { status: 404 }
            );
        }

        // Validation des critiques (reviews) avec le type Review
        if (reviews && !Array.isArray(reviews)) {
            return NextResponse.json(
                { message: "Le format des 'reviews' est invalide." },
                { status: 400 }
            );
        }

        if (reviews) {
            reviews.forEach((review: Review) => {
                if (!review.userId || !review.comment || review.rating === undefined) {
                    throw new Error("Données de review invalides.");
                }
                if (!Types.ObjectId.isValid(review.userId)) {
                    throw new Error("L'identifiant 'userId' dans les reviews est invalide.");
                }
                if (review.rating < 1 || review.rating > 5) {
                    throw new Error("La note doit être comprise entre 1 et 5.");
                }
            });
        }

        // Création du livre
        const newBook = new Book({
            title,
            author,
            publishedDate,
            category,
            rating: rating || 0, // Défaut à 0 si non fourni
            reviews: reviews || [],
            userId: new Types.ObjectId(userId),
        });

        await newBook.save();
        return new NextResponse(
            JSON.stringify({ message: "Livre créé avec succès.", book: newBook }),
            { status: 201 }
        );
    } catch (error) {
        console.error("Erreur lors de la création du livre:", error);
        return new NextResponse(
            JSON.stringify({ message: "Erreur lors de la création du livre.", error: error }),
            { status: 500 }
        );
    }
};

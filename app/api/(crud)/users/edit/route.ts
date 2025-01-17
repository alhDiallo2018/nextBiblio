import connect from "@/lib/db";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Cette route permet de récupérer la liste complète de tous les utilisateurs.
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60a7b88fa9a19c001f1b2f5d"
 *                   email:
 *                     type: string
 *                     example: "user@example.com"
 *                   username:
 *                     type: string
 *                     example: "johndoe"
 *                   password:
 *                     type: string
 *                     example: "hashedpassword"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2022-12-01T12:00:00Z"
 *       500:
 *         description: Erreur interne du serveur lors de la récupération des utilisateurs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la récupération des utilisateurs"
 */

export const GETTousLesUtilisateurs = async () => {
    try {
        await connect();

        // Récupérer tous les utilisateurs
        const users = await User.find();
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        return NextResponse.json(
            { message: "Erreur lors de la récupération des utilisateurs", error },
            { status: 500 }
        );
    }
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Permet de récupérer la liste de tous les utilisateurs.
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60a7b88fa9a19c001f1b2f5d"
 *                   email:
 *                     type: string
 *                     example: "user@example.com"
 *                   username:
 *                     type: string
 *                     example: "johndoe"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2022-12-01T12:00:00Z"
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur interne du serveur lors de la récupération des utilisateurs"
 */

export const GET = async () => {
    try {
        await connect();
        const users = await User.find();
        return new NextResponse(JSON.stringify(users), { status: 200 });
    } catch (error) {
        return new NextResponse("Error in fetching users" + error, { status: 500 });
    }
};

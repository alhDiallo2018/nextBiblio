import connect from "@/lib/db";
import User from "@/lib/models/user";
import authenticate from "@/lib/utils/authenticate";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: Supprime un utilisateur
 *     description: Permet de supprimer un utilisateur en utilisant son `userId`. L'utilisateur doit être authentifié et ne peut supprimer que son propre compte.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: L'ID de l'utilisateur à supprimer.
 *         schema:
 *           type: string
 *           example: "60a7b88fa9a19c001f1b2f5d"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: L'utilisateur a été supprimé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: Mauvaise requête, `userId` manquant ou invalide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid userId"
 *       401:
 *         description: Échec de l'authentification ou jeton invalide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication failed or invalid token."
 *       403:
 *         description: L'utilisateur n'est pas autorisé à supprimer un autre utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to delete another user's information."
 *       404:
 *         description: L'utilisateur à supprimer n'a pas été trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Erreur interne du serveur lors de la suppression de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting user"
 */

export const DELETE = async (request: NextRequest) => {
    try {
        // Extraction des paramètres de l'URL
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { message: "UserId is required" },
                { status: 400 }
            );
        }

        // Authentification de l'utilisateur à partir du token
        const decoded = authenticate(request);

        // Vérification de l'authentification et du type de `decoded`
        if (typeof decoded === "string" || !decoded.userId) {
            return NextResponse.json(
                { message: "Authentication failed or invalid token." },
                { status: 401 }
            );
        }

        // Vérification des autorisations (un utilisateur ne peut pas supprimer un autre utilisateur)
        if (decoded.userId !== userId) {
            return NextResponse.json(
                { message: "You are not authorized to delete another user's information." },
                { status: 403 }
            );
        }

        // Vérification de la validité de `userId`
        if (!Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { message: "Invalid userId" },
                { status: 400 }
            );
        }

        // Connexion à la base de données
        await connect();

        // Suppression de l'utilisateur
        const deleteUser = await User.findByIdAndDelete(userId);

        // Vérification si l'utilisateur a bien été trouvé et supprimé
        if (!deleteUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Réponse de succès
        return NextResponse.json(
            { message: "User deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { message: "Error deleting user", error: error || error },
            { status: 500 }
        );
    }
};

import connect from "@/lib/db";
import User from "@/lib/models/user";
import { generateToken } from "@/lib/utils/jwt";
import { NextResponse } from "next/server";
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login and token generation
 *     description: This endpoint allows a user to log in by providing their email and password. If the credentials are correct, a JWT token is generated and returned.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *     responses:
 *       200:
 *         description: Login successful and JWT token generated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 token:
 *                   type: string
 *                   description: The JWT token generated for the authenticated user.
 *       400:
 *         description: Missing email or password in the request body.
 *       401:
 *         description: Incorrect password.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
export const POST = async (request: Request) => {
    try {
        await connect();
        const { email, password } = await request.json();

        // Validation des champs requis
        if (!email || !password) {
            return NextResponse.json(
                { message: "Email et mot de passe sont requis." },
                { status: 400 }
            );
        }

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: "Utilisateur non trouvé." },
                { status: 404 }
            );
        }

        // Vérification du mot de passe
        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) {
            return NextResponse.json(
                { message: "Mot de passe incorrect." },
                { status: 401 }
            );
        }

        // Générer un token pour l'utilisateur
        const token = generateToken(user._id.toString());

        return NextResponse.json(
            { message: "Connexion réussie.", token },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        return NextResponse.json(
            { message: "Erreur lors de la connexion." },
            { status: 500 }
        );
    }
};

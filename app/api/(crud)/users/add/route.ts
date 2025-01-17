import User from "@/lib/models/user";
import { generateToken } from "@/lib/utils/jwt";
import { NextResponse } from "next/server";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: L'email de l'utilisateur
 *         username:
 *           type: string
 *           description: Le nom d'utilisateur
 *         password:
 *           type: string
 *           description: Le mot de passe de l'utilisateur
 *       required:
 *         - email
 *         - username
 *         - password
 * 
 * /api/users:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     description: Permet de créer un nouvel utilisateur avec email, nom d'utilisateur et mot de passe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur créé avec succès"
 *                 token:
 *                   type: string
 *                   description: Le token d'authentification JWT
 *       400:
 *         description: Demande invalide, champs manquants ou utilisateur déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tous les champs sont requis."
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la création de l'utilisateur."
 */

interface IUser {
    email: string;
    username: string;
    password: string;
}

export const POST = async (request: Request) => {
    try {
        const { email, username, password }: IUser = await request.json();

        // Validation des champs requis
        if (!email || !username || !password) {
            return NextResponse.json({ message: "Tous les champs sont requis." }, { status: 400 });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "Un utilisateur avec cet email existe déjà." }, { status: 400 });
        }

        // Création d'un nouvel utilisateur
        const user = new User({
            email,
            username,
            password: await new User().encryptPassword(password), // Utilisation de l'instance pour appeler encryptPassword
        });

        await user.save();

        const token = generateToken(user._id.toString());

        return NextResponse.json({ message: "Utilisateur créé avec succès", token }, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        return NextResponse.json({ message: "Erreur lors de la création de l'utilisateur." }, { status: 500 });
    }
};

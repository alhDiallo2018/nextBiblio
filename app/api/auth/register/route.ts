import connect from "@/lib/db";
import User from "@/lib/models/user";
import { generateToken } from "@/lib/utils/jwt";
import { NextResponse } from "next/server";

interface IUser {
    email: string;
    username: string;
    password: string;
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user and generate a token
 *     description: This endpoint allows a user to register by providing their email, username, and password. If the registration is successful, a JWT token is generated and returned.
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
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *     responses:
 *       201:
 *         description: User successfully created and JWT token generated.
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
 *         description: Missing required fields or invalid data (email format, existing user).
 *       500:
 *         description: Internal server error.
 */
export const POST = async (request: Request) => {
    try {
        await connect();

        console.log("Démarrage de la création de l'utilisateur");

        const { email, username, password }: IUser = await request.json();
        console.log("Données reçues :", { email, username, password });

        if (!email || !username || !password) {
            return NextResponse.json({ message: "Tous les champs sont requis." }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ message: "L'email fourni est invalide." }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "Un utilisateur avec cet email existe déjà." }, { status: 400 });
        }


        const user = new User({
            email,
            username,
            password: password, 
        });
        
        user.password = await user.encryptPassword(password);

        console.log("Création de l'utilisateur...");
        await user.save();
        console.log("Utilisateur enregistré avec succès");

        const token = generateToken(user._id.toString());
        console.log("Token généré :", token);

        return NextResponse.json({ message: "Utilisateur créé avec succès", token }, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        return NextResponse.json({ message: "Erreur lors de la création de l'utilisateur." }, { status: 500 });
    }
};


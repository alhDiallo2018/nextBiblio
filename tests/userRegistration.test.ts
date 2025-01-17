
import { app } from "@/app/api";
import request from "supertest";

describe("POST /api/auth/register", () => {
    it("devrait enregistrer un utilisateur et retourner un token", async () => {
        const response = await request(app)
            .post("/api/register")
            .send({
                email: "ono@gmail.com",
                username: "testuser",
                password: "password123",
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Utilisateur créé avec succès");
        expect(response.body).toHaveProperty("token");
    });

    it("devrait retourner une erreur si les champs sont manquants", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "alhassane@gmail.com",
                password: "password123",
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Tous les champs sont requis.");
    });

    it("devrait retourner une erreur si l'email est invalide", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "invalid-email",
                username: "ono",
                password: "password123",
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "L'email fourni est invalide.");
    });
});

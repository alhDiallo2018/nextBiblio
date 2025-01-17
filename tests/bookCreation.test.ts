// tests/bookCreation.test.ts

import { app } from "@/app/api";
import request from "supertest";

describe("POST /api/book/add", () => {
    it("devrait créer un livre et retourner les informations du livre", async () => {
        const response = await request(app)
            .post("/api/book/add")
            .send({
                title: "Nouveau livre",
                author: "Auteur Test",
                description: "Un livre pour les tests.",
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Livre créé avec succès");
        expect(response.body).toHaveProperty("book");
        expect(response.body.book).toHaveProperty("title", "Nouveau livre");
    });

    it("devrait retourner une erreur si le titre est manquant", async () => {
        const response = await request(app)
            .post("/api/book/add")
            .send({
                author: "Auteur Test",
                description: "Un livre sans titre.",
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Le titre est requis.");
    });
});

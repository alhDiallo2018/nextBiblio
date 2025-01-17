
import { app } from "@/app/api";
import request from "supertest";

describe("PATCH /api/book/review", () => {
    it("devrait ajouter ou mettre à jour un commentaire et une note pour un livre", async () => {
        // Remplacez par des IDs valides
        const userId = "user-id-valid";
        const bookId = "book-id-valid";

        const response = await request(app)
            .patch(`/api/book/review?userId=${userId}&bookId=${bookId}`)
            .send({
                comment: "Excellent livre!",
                rating: 5,
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Commentaire et note mis à jour avec succès");
        expect(response.body.book.reviews[0]).toHaveProperty("comment", "Excellent livre!");
        expect(response.body.book.reviews[0]).toHaveProperty("rating", 5);
    });

    it("devrait retourner une erreur si la note est en dehors de la plage valide", async () => {
        const userId = "user-id-valid";
        const bookId = "book-id-valid";

        const response = await request(app)
            .patch(`/api/book/review?userId=${userId}&bookId=${bookId}`)
            .send({
                comment: "Moyenne.",
                rating: 6, // Note invalide (en dehors de la plage 1-5)
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "La note doit être entre 1 et 5");
    });

    it("devrait retourner une erreur si aucun commentaire n'est trouvé pour mise à jour", async () => {
        const userId = "user-id-valid";
        const bookId = "book-id-not-found"; // ID de livre non existant

        const response = await request(app)
            .patch(`/api/book/review?userId=${userId}&bookId=${bookId}`)
            .send({
                comment: "Ce livre est introuvable.",
                rating: 3,
            });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Commentaire non trouvé");
    });
});


import { NextApiRequest, NextApiResponse } from "next";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "API Documentation",
        version: "1.0.0",
        description: "Documentation de l'API Biblio Next.js",
    },
    servers: [
        {
            url: "http://localhost:3000/api", 
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ["./app/api/**/*.ts"], 
};

const swaggerSpec = swaggerJSDoc(options);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        res.setHeader("Content-Type", "application/json");
        res.status(200).json(swaggerSpec); 
    } else {
        res.status(405).json({ message: "Méthode non autorisée" });
    }
}

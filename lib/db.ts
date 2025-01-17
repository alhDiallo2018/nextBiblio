import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
    if (!MONGODB_URI) {
        throw new Error("La variable MONGODB_URI n'est pas définie dans l'environnement.");
    }

    const connectionState = mongoose.connection.readyState;

    if (connectionState === 1) {
        console.log("Vous êtes déjà connecté");
        return;
    }

    if (connectionState === 2) {
        console.log("Connexion en cours...");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: "nextBliblio",
            bufferCommands: false,
        });
        console.log("Connecté à la base de données");
    } catch (error) {
        console.error("Erreur lors de la connexion à la base de données :", error);
        throw new Error("Erreur lors de la connexion à la base de données");
    }
};

mongoose.connection.on("connected", () => {
    console.log("Mongoose est connecté à MongoDB");
});

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose est déconnecté de MongoDB");
});

mongoose.connection.on("error", (error) => {
    console.error("Erreur de connexion Mongoose :", error);
});

export default connect;

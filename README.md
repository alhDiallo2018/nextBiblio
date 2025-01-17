Biblio

Biblio est un test technique visant à développer des APIs CRUD pour la gestion des livres (books), des utilisateurs (users), ainsi que des notations (commentaires et votes), en utilisant MongoDB et Mongoose comme ORM.

Getting Started

Démarrage du serveur de développement

Exécutez la commande suivante :

npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev

Ensuite, ouvrez http://localhost:3000 dans votre navigateur pour voir le résultat.

Vous pouvez commencer à modifier la page en éditant le fichier app/page.tsx. La page se mettra automatiquement à jour au fur et à mesure des modifications.

Configuration de la Base de Données

MongoDB et Mongoose

Le projet utilise MongoDB pour stocker les données et Mongoose comme ORM pour interagir avec la base de données.

Installation

Assurez-vous d'avoir MongoDB installé et en cours d'exécution. Vous pouvez également utiliser un service cloud comme MongoDB Atlas.

Ajoutez Mongoose à votre projet :

npm install mongoose

Connexion à MongoDB

Créez un fichier config/db.js pour configurer la connexion à MongoDB :

// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connecté avec succès !");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB :", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

Ajoutez votre URI MongoDB dans un fichier .env :

MONGO_URI=mongodb://localhost:27017/biblio
# Pour MongoDB Atlas :
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/biblio?retryWrites=true&w=majority

Importez et exécutez la connexion dans votre fichier principal (server.js ou app.js) :

const connectDB = require("./config/db");

connectDB();

Modèles Mongoose

User Model (Utilisateur)

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Méthode pour chiffrer le mot de passe avant de sauvegarder
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

Book Model (Livre)

const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  publishedDate: { type: Date, required: true },
  genre: { type: String, required: true },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment: { type: String },
      rating: { type: Number, min: 1, max: 5 },
    },
  ],
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;

Endpoints MongoDB

Exemple : Ajouter un livre

const Book = require("../models/Book");

const addBook = async (req, res) => {
  try {
    const { title, author, publishedDate, genre } = req.body;
    const book = new Book({ title, author, publishedDate, genre });
    await book.save();
    res.status(201).json({ message: "Livre ajouté avec succès", book });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du livre", error });
  }
};

module.exports = { addBook };

Exemple : Authentification avec JWT

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Connexion réussie", token });
  } catch (error) {
    res.status(500).json({ message: "Erreur d'authentification", error });
  }
};

module.exports = { login };

Ajoutez une clé secrète pour JWT dans le fichier .env :

JWT_SECRET=ma_super_cle_secrete

Tests

Pour exécuter les tests, utilisez la commande suivante :

npx jest

Cela exécutera les tests unitaires pour vérifier le bon fonctionnement des fonctionnalités implémentées.

Quelques endpoints pour tester

S'inscrire :

POST http://localhost:3000/api/auth/register

S'authentifier :

POST http://localhost:3000/api/auth/login

Ajouter un livre :

POST http://localhost:3000/api/book/add?userId=

Filtrer par auteur :

GET http://localhost:3000/api/book/search?author=&publishedDate&sortOrder=asc

Commenter un livre :

POST http://localhost:3000/api/book/review?userId=&bookId=

Points essentiels
MongoDB pour la persistance des données.
Mongoose pour la gestion des modèles et des relations.
JWT pour l'authentification sécurisée.
bcrypt pour le chiffrement des mots de passe des utilisateurs.


Ressources pour Next.js
Documentation officielle Next.js
Tutoriel interactif Learn Next.js
Dépôt GitHub de Next.js
https://youtu.be/-j7qvs3zKqM?si=Z4Dir5MdVr3RcUI2

Alhamdoulilah ! 🎉 MongoDB et Mongoose sont d'excellents choix pour gérer des bases de données modernes et évolutives. 🚀
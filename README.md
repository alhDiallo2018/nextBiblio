Biblio

Biblio est un test technique visant à développer des APIs CRUD pour la gestion des livres (books), des utilisateurs (users), ainsi que des notations (commentaires et votes).

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

Utilisation des polices

Ce projet utilise next/font pour optimiser et charger automatiquement Geist, une nouvelle famille de polices créée par Vercel.

En savoir plus

Pour en savoir plus sur Next.js, consultez les ressources suivantes :

Documentation Next.js : Découvrez les fonctionnalités et l'API de Next.js.

Apprendre Next.js : Un tutoriel interactif pour maîtriser Next.js.

Vous pouvez également consulter le référentiel GitHub de Next.js. Vos retours et contributions sont les bienvenus !

Déploiement sur Vercel

La méthode la plus simple pour déployer votre application Next.js est d'utiliser la plateforme Vercel, créée par les auteurs de Next.js.

Consultez notre documentation sur le déploiement pour plus de détails.

Fonctionnalités demandées

Books (Livres) :

Création, lecture, mise à jour et suppression (CRUD).

Users (Utilisateurs) :

Création, lecture, mise à jour et suppression (CRUD).

Notations (Commentaires et Votes) :

Ajout de commentaires.

Système de vote.

Tests

Pour exécuter les tests, utilisez la commande suivante :

npx jest

Cela exécutera les tests unitaires pour vérifier le bon fonctionnement des fonctionnalités implémentées.
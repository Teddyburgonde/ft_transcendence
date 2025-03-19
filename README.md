# ft_transcendance

Etapes pour avoir un back fonctionnel: 

1️⃣ Initialisation du projet

✅ 1. Installer Node.js et SQLite ✅
✅ 2. Initialiser le projet avec npm init -y ✅
✅ 3. Installer les dépendances (fastify, sqlite3, etc.) ✅

2️⃣ Configuration de la base de données (db.js)

✅ 4. Créer un fichier db.js ✅
✅ 5. Connecter SQLite et ouvrir database.db ✅
✅ 6. Créer les tables users et scores si elles n’existent pas ✅
✅ 7. Exporter db pour l’utiliser dans les autres fichiers ✅

3️⃣ Structuration du projet

✅ 8. Créer un dossier routes/ pour organiser les routes (users.js, scores.js) ✅
✅ 9. Créer un dossier crud/ pour séparer la logique des requêtes SQL (postUser.js, getUsers.js, etc.) ✅

4️⃣ Création des routes API (users.js & scores.js)

🔄 10. POST /users → Ajouter un utilisateur (En cours...)
❌ 11. GET /users → Récupérer tous les utilisateurs
❌ 12. GET /users/:id → Récupérer un utilisateur spécifique
❌ 13. PUT /users/:id → Mettre à jour un utilisateur
❌ 14. DELETE /users/:id → Supprimer un utilisateur

📌 Routes /scores :
❌ 15. POST /scores → Ajouter un score
❌ 16. GET /scores → Récupérer tous les scores
❌ 17. GET /scores/:id → Récupérer les scores d’un utilisateur

5️⃣ Mise en production et optimisation

❌ 18. Ajouter la gestion des erreurs pour chaque route
❌ 19. Protéger les données sensibles (ex: ne jamais renvoyer les mots de passe)
❌ 20. Dockeriser le projet avec Dockerfile et docker-compose.yml
❌ 21. Configurer un système d'authentification (ex: Token JWT, 2FA si nécessaire)


Commandes utiles :

- Lancer le server:
node server
- Aller sur la page d'accueil: <br>
http://localhost:3000

# ft_transcendance

Etapes pour avoir un back fonctionnel: <br> <br>

1️⃣ Initialisation du projet <br> <br>

✅ 1. Installer Node.js et SQLite ✅ <br>
✅ 2. Initialiser le projet avec npm init -y ✅ <br> 
✅ 3. Installer les dépendances (fastify, sqlite3, etc.) ✅ <br> <br>

2️⃣ Configuration de la base de données (db.js) <br> <br>

✅ 4. Créer un fichier db.js ✅ <br>
✅ 5. Connecter SQLite et ouvrir database.db ✅ <br>
✅ 6. Créer les tables users et scores si elles n’existent pas ✅ <br>
✅ 7. Exporter db pour l’utiliser dans les autres fichiers ✅ <br> <br>

3️⃣ Structuration du projet <br> <br>

✅ 8. Créer un dossier routes/ pour organiser les routes (users.js, scores.js) ✅ <br>
✅ 9. Créer un dossier crud/ pour séparer la logique des requêtes SQL (postUser.js, getUsers.js, etc.) ✅ <br> <br>

4️⃣ Création des routes API (users.js & scores.js) <br> <br>

✅ 10. POST /users → Ajouter un utilisateur ✅ <br>
✅ 11. GET /users → Récupérer tous les utilisateurs ✅ <br>
✅ 12. GET /users/:id → Récupérer un utilisateur spécifique ✅ <br>
🔄 13. PUT /users/:id → Mettre à jour un utilisateur (En cours...) <br>
❌ 14. DELETE /users/:id → Supprimer un utilisateur <br>

📌 Routes /scores : <br>
❌ 15. POST /scores → Ajouter un score <br>
❌ 16. GET /scores → Récupérer tous les scores <br>
❌ 17. GET /scores/:id → Récupérer les scores d’un utilisateur <br> <br>

5️⃣ Mise en production et optimisation <br> <br>

❌ 18. Ajouter la gestion des erreurs pour chaque route <br>
❌ 19. Protéger les données sensibles (ex: ne jamais renvoyer les mots de passe) <br>
❌ 20. Dockeriser le projet avec Dockerfile et docker-compose.yml <br>
❌ 21. Configurer un système d'authentification (ex: Token JWT, 2FA si nécessaire) <br>

<br>
<br>
<br>

Commandes utiles:

- Aller sur la page d'accueil: <br>
http://localhost:3000



Base de données: 

Si tu veux tester ton crud avec curl : 

Method POST
Ajouter une row dans ta base de données avec curl: <br>
exemple: <br>
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "roger1", "email": "roger1@example.com", "password": "123456"}'

Method GET
Afficher la liste des rows dans ta base de données avec curl:<br>
curl http://localhost:3000/users | jq


Method GET by ID
Afficher la liste d'un row dans ta base de données avec curl:<br>
curl http://localhost:3000/users/2 | jq


- Regarder ce qu'il y a dans la tables: 
sqlite3 database.db <br>
SELECT * FROM nameoftable; <br>



Liens utiles : 

Pour le CRUD: 
https://dev.to/elijahtrillionz/build-a-crud-api-with-fastify-688

Doc officiel:
https://fastify.dev/ 
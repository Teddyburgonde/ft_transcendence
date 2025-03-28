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
✅ 13. PUT /users/:id → Mettre à jour un utilisateur ✅ <br>
✅ 14. DELETE /users/:id → Supprimer un utilisateur ✅ <br>

📌 Routes /scores : <br>
✅ 15. POST /scores → Ajouter un score ✅<br>
✅ 16. GET /scores → Récupérer tous les scores ✅<br>
✅ 17. GET /scores/:id → Récupérer les scores d’un utilisateur ✅<br>
✅ 18. DELETE /scores/:id → Supprimer un score ✅<br>
 <br>

5️⃣ Mise en production et optimisation <br> <br>

✅ 19. Configurer un système d'authentification (ex: Token JWT) pour login ✅
✅ 20. Ajouter la gestion des erreurs pour chaque route <br>
✅ 21. Protéger les données sensibles (ex: ne jamais renvoyer les mots de passe) <br>
✅ 22. Dockeriser le projet avec Dockerfile et docker-compose.yml ✅ <br>
✅ 23. Protéger les routes privées avec preHandler: fastify.authenticate <br> ✅
✅ 24. Créer une route /register pour permettre à un utilisateur de s’inscrire <br> ✅
✅ 25. Hasher le mot de passe dans /register avec bcrypt ✅ <br>
✅ 26. Vérifier le mot de passe hashé dans /login avec bcrypt.compare() ✅<br>
✅ 27. Vérifier et uniformiser les erreurs (400, 401, 500, etc.) dans toutes les routes ✅<br>



FRONT: 

1️⃣ Initialisation du projet <br><br>


✅ 1. Initialiser le projet avec React et TypeScript ✅ <br>

✅ 2. Installer Tailwind CSS ✅<br> 
 

2️⃣ Creation des pages <br><br>

1. Créer la page /home ❌ <br> 

2. Ajouter React Router pour gérer les routes SPA ❌ <br> 



<br> <br>









6️⃣ Module  <br> <br>

✅ Authentification 2FA <br> ✅
<br>
<br>
<br>


1. Obtenir le token <br>
```c
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jean2@example.com", "password": "alain"}'
```

2. Obtenir le qrcode

```c
curl -X POST http://localhost:3000/enable-2fa \
  -H "Authorization: Bearer <token>"

```

3. Verification du code de google authentificator

```c
curl -X POST http://localhost:3000/verify-2fa \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJqZWFuMkBleGFtcGxlLmNvbSIsImlhdCI6MTc0Mjg5NTg4MH0.NTirDyiuysBkmAzGi4r43B3aUv5kLYsHWTaZrwblAHs" \
  -H "Content-Type: application/json" \
  -d '{"token": "code a 6 chiffres"}'

```

Commandes utiles:

- Aller sur la page d'accueil: <br>
```c
http://localhost:3000

```

Base de données: 

Si tu veux tester ton crud avec curl : 

Method POST pour users
Ajouter une row dans ta base de données avec curl: <br>
exemple: <br>
```c
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "jean", "email": "jean@example.com", "password": "alain"}'
```


Method GET pour users
Afficher la liste des rows dans ta base de données avec curl:<br>
```c
curl http://localhost:3000/users | jq
```

Method GET by ID pour users
Afficher la liste d'un row dans ta base de données avec curl:<br>
```c
curl http://localhost:3000/users/2 | jq
```

Method Update pour users
Update une row dans ta base de données avec curl:<br>

```c
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"username":"stan_updated","email":"stan@new.com","password":"supersecure"}' | jq
```


Method delete pour users
Delete une row dans ta base de données avec curl: <br>

```c
curl -X DELETE http://localhost:3000/users/1 | jq
```


Method POST pour scores 
Ajouter une row dans ta base de données avec curl: <br>
exemple: <br>
```c
curl -X POST http://localhost:3000/scores \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"opponent_id":2,"score_user":5}' | jq
```

Method GET pour scores
Afficher la liste des rows dans ta base de données avec curl:<br>

```c
curl http://localhost:3000/scores | jq
```


Method GET by ID pour users
Afficher la liste d'un row dans ta base de données avec curl:<br>

```c
curl http://localhost:3000/scores/user/1 | jq
```

Method delete pour scores
Delete une row dans ta base de données avec curl: <br>
```c
curl -X DELETE http://localhost:3000/scores/1 | jq
```


Pour tester authentification JWT

```c
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "stan@new.com", "password": "supersecure"}'
```

- Regarder ce qu'il y a dans la tables: 
```c
sqlite3 database.db <br>
SELECT * FROM nameoftable; <br>
```


CROQUIS : 

![home](https://github.com/user-attachments/assets/89148e46-8002-4aad-881f-ead0e9206657)


Liens utiles : 

Pour le CRUD: 
https://dev.to/elijahtrillionz/build-a-crud-api-with-fastify-688 <br>

Doc officiel:
https://fastify.dev/ <br>

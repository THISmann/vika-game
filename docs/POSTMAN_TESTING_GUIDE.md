# Guide de Test API avec Postman

Ce guide vous permet de tester tous les endpoints de l'application IntelectGame en local avec Postman.

## 📋 Prérequis

1. **Services démarrés** :
   ```bash
   docker-compose up -d
   # ou
   npm start dans chaque service
   ```

2. **Ports disponibles** :
   - Auth Service : `http://localhost:3001`
   - Quiz Service : `http://localhost:3002`
   - Game Service : `http://localhost:3003`

3. **Postman installé** : [Télécharger Postman](https://www.postman.com/downloads/)

---

## 🎯 Endpoint : Ajouter une Question

### **POST** `/quiz/create`

**URL complète** : `http://localhost:3002/quiz/create`

**Méthode** : `POST`

**Headers** :
```
Content-Type: application/json
```

**Body** (raw JSON) :
```json
{
  "question": "Quelle est la capitale de la France ?",
  "choices": ["Paris", "Londres", "Berlin", "Madrid"],
  "answer": "Paris"
}
```

**Exemple de réponse (200 OK)** :
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "id": "q1733456789123",
  "question": "Quelle est la capitale de la France ?",
  "choices": ["Paris", "Londres", "Berlin", "Madrid"],
  "answer": "Paris",
  "__v": 0
}
```

**Erreurs possibles** :
- `400 Bad Request` : Champs manquants
  ```json
  {
    "error": "Missing fields"
  }
  ```
- `500 Internal Server Error` : Erreur serveur
  ```json
  {
    "error": "Internal server error"
  }
  ```

---

## 📚 Tous les Endpoints

### 🔐 Auth Service (Port 3001)

#### 1. Test du service
- **GET** `http://localhost:3001/auth/test`
- **Réponse** : `{ "message": "Auth route working well now!" }`

#### 2. Connexion Admin
- **POST** `http://localhost:3001/auth/admin/login`
- **Body** :
  ```json
  {
    "username": "admin",
    "password": "admin"
  }
  ```
- **Réponse** :
  ```json
  {
    "success": true,
    "message": "Login successful"
  }
  ```

#### 3. Inscription Joueur
- **POST** `http://localhost:3001/auth/players/register`
- **Body** :
  ```json
  {
    "name": "John Doe"
  }
  ```
- **Réponse** :
  ```json
  {
    "id": "p1733456789123",
    "name": "John Doe"
  }
  ```

#### 4. Liste des joueurs
- **GET** `http://localhost:3001/auth/players`
- **Réponse** :
  ```json
  [
    {
      "id": "p1733456789123",
      "name": "John Doe"
    }
  ]
  ```

#### 5. Détails d'un joueur
- **GET** `http://localhost:3001/auth/players/:id`
- **Exemple** : `http://localhost:3001/auth/players/p1733456789123`
- **Réponse** :
  ```json
  {
    "id": "p1733456789123",
    "name": "John Doe"
  }
  ```

---

### 📝 Quiz Service (Port 3002)

#### 1. Test du service
- **GET** `http://localhost:3002/quiz/test`
- **Réponse** : `{ "message": "service route working well now!" }`

#### 2. **Ajouter une question** ⭐
- **POST** `http://localhost:3002/quiz/create`
- **Body** :
  ```json
  {
    "question": "Quelle est la capitale de la France ?",
    "choices": ["Paris", "Londres", "Berlin", "Madrid"],
    "answer": "Paris"
  }
  ```

#### 3. Liste des questions (sans réponses)
- **GET** `http://localhost:3002/quiz/all`
- **OU** `http://localhost:3002/quiz/questions`
- **Réponse** :
  ```json
  [
    {
      "id": "q1733456789123",
      "question": "Quelle est la capitale de la France ?",
      "choices": ["Paris", "Londres", "Berlin", "Madrid"]
    }
  ]
  ```

#### 4. Liste complète des questions (avec réponses)
- **GET** `http://localhost:3002/quiz/full`
- **Réponse** :
  ```json
  [
    {
      "id": "q1733456789123",
      "question": "Quelle est la capitale de la France ?",
      "choices": ["Paris", "Londres", "Berlin", "Madrid"],
      "answer": "Paris"
    }
  ]
  ```

#### 5. Modifier une question
- **PUT** `http://localhost:3002/quiz/:id`
- **Exemple** : `http://localhost:3002/quiz/q1733456789123`
- **Body** :
  ```json
  {
    "question": "Quelle est la capitale de l'Espagne ?",
    "choices": ["Paris", "Londres", "Berlin", "Madrid"],
    "answer": "Madrid"
  }
  ```

#### 6. Supprimer une question
- **DELETE** `http://localhost:3002/quiz/:id`
- **Exemple** : `http://localhost:3002/quiz/q1733456789123`
- **Réponse** :
  ```json
  {
    "message": "Deleted"
  }
  ```

---

### 🎮 Game Service (Port 3003)

#### 1. Test du service
- **GET** `http://localhost:3003/game/test`
- **Réponse** : `{ "message": "Auth route working well now!" }`

#### 2. État du jeu
- **GET** `http://localhost:3003/game/state`
- **Réponse** :
  ```json
  {
    "isStarted": false,
    "currentQuestionIndex": -1,
    "currentQuestionId": null,
    "questionStartTime": null,
    "questionDuration": 30000,
    "connectedPlayersCount": 0,
    "gameSessionId": null,
    "gameCode": "ABC123"
  }
  ```

#### 3. Code du jeu
- **GET** `http://localhost:3003/game/code`
- **Réponse** :
  ```json
  {
    "gameCode": "ABC123"
  }
  ```

#### 4. Vérifier le code du jeu
- **POST** `http://localhost:3003/game/verify-code`
- **Body** :
  ```json
  {
    "code": "ABC123"
  }
  ```
- **Réponse** :
  ```json
  {
    "valid": true,
    "gameCode": "ABC123",
    "isStarted": false,
    "message": "Code valide. Vous pouvez continuer."
  }
  ```

#### 5. Nombre de joueurs connectés
- **GET** `http://localhost:3003/game/players/count`
- **Réponse** :
  ```json
  {
    "count": 2
  }
  ```

#### 6. Liste des joueurs connectés
- **GET** `http://localhost:3003/game/players`
- **Réponse** :
  ```json
  {
    "players": [
      {
        "id": "p1733456789123",
        "name": "John Doe"
      }
    ],
    "count": 1
  }
  ```

#### 7. Démarrer le jeu
- **POST** `http://localhost:3003/game/start`
- **Body** :
  ```json
  {
    "questionDuration": 30
  }
  ```
- **Réponse** :
  ```json
  {
    "message": "Game started",
    "state": { ... }
  }
  ```

#### 8. Question suivante
- **POST** `http://localhost:3003/game/next`
- **Réponse** :
  ```json
  {
    "message": "Next question",
    "state": { ... }
  }
  ```

#### 9. Terminer le jeu
- **POST** `http://localhost:3003/game/end`
- **Réponse** :
  ```json
  {
    "message": "Game ended",
    "state": { ... }
  }
  ```

#### 10. Répondre à une question
- **POST** `http://localhost:3003/game/answer`
- **Body** :
  ```json
  {
    "playerId": "p1733456789123",
    "questionId": "q1733456789123",
    "answer": "Paris"
  }
  ```
- **Réponse** :
  ```json
  {
    "correct": true,
    "correctAnswer": "Paris",
    "playerName": "John Doe",
    "answered": true,
    "message": "Bonne réponse ! Votre score a été mis à jour."
  }
  ```

#### 11. Score d'un joueur
- **GET** `http://localhost:3003/game/score/:playerId`
- **Exemple** : `http://localhost:3003/game/score/p1733456789123`
- **Réponse** :
  ```json
  {
    "playerId": "p1733456789123",
    "playerName": "John Doe",
    "score": 5
  }
  ```

#### 12. Classement
- **GET** `http://localhost:3003/game/leaderboard`
- **Réponse** :
  ```json
  [
    {
      "playerId": "p1733456789123",
      "playerName": "John Doe",
      "score": 5
    },
    {
      "playerId": "p1733456789124",
      "playerName": "Jane Doe",
      "score": 3
    }
  ]
  ```

#### 13. Résultats des questions
- **GET** `http://localhost:3003/game/results`
- **Réponse** :
  ```json
  {
    "q1733456789123": {
      "correctAnswer": "Paris",
      "playerResults": {
        "p1733456789123": {
          "answer": "Paris",
          "correct": true
        }
      }
    }
  }
  ```

#### 14. Supprimer le jeu
- **DELETE** `http://localhost:3003/game/delete`
- **Réponse** :
  ```json
  {
    "message": "Game deleted"
  }
  ```

---

## 🧪 Scénario de Test Complet

### 1. Vérifier que les services fonctionnent
```
GET http://localhost:3001/auth/test
GET http://localhost:3002/quiz/test
GET http://localhost:3003/game/test
```

### 2. Ajouter des questions
```
POST http://localhost:3002/quiz/create
Body: {
  "question": "Quelle est la capitale de la France ?",
  "choices": ["Paris", "Londres", "Berlin", "Madrid"],
  "answer": "Paris"
}

POST http://localhost:3002/quiz/create
Body: {
  "question": "Quel est le plus grand océan ?",
  "choices": ["Atlantique", "Pacifique", "Indien", "Arctique"],
  "answer": "Pacifique"
}
```

### 3. Vérifier les questions ajoutées
```
GET http://localhost:3002/quiz/all
```

### 4. Inscrire un joueur
```
POST http://localhost:3001/auth/players/register
Body: {
  "name": "John Doe"
}
```

### 5. Obtenir le code du jeu
```
GET http://localhost:3003/game/code
```

### 6. Démarrer le jeu
```
POST http://localhost:3003/game/start
Body: {
  "questionDuration": 30
}
```

### 7. Répondre à une question
```
POST http://localhost:3003/game/answer
Body: {
  "playerId": "p1733456789123",
  "questionId": "q1733456789123",
  "answer": "Paris"
}
```

### 8. Vérifier le score
```
GET http://localhost:3003/game/score/p1733456789123
```

### 9. Voir le classement
```
GET http://localhost:3003/game/leaderboard
```

---

## 📦 Collection Postman

Pour importer une collection Postman complète, créez un fichier JSON avec cette structure :

```json
{
  "info": {
    "name": "IntelectGame API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Quiz Service",
      "item": [
        {
          "name": "Add Question",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"question\": \"Quelle est la capitale de la France ?\",\n  \"choices\": [\"Paris\", \"Londres\", \"Berlin\", \"Madrid\"],\n  \"answer\": \"Paris\"\n}"
            },
            "url": {
              "raw": "http://localhost:3002/quiz/create",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3002",
              "path": ["quiz", "create"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🔍 Dépannage

### Erreur "ECONNREFUSED"
- Vérifiez que les services sont démarrés : `docker-compose ps`
- Vérifiez les ports : `netstat -an | grep 3001`

### Erreur "Missing fields"
- Vérifiez que le header `Content-Type: application/json` est présent
- Vérifiez que tous les champs requis sont dans le body

### Erreur "Internal server error"
- Vérifiez les logs des services : `docker-compose logs quiz-service`
- Vérifiez la connexion MongoDB : `docker-compose logs mongodb`

---

## 💡 Astuces Postman

1. **Variables d'environnement** : Créez un environnement avec :
   - `base_url_auth`: `http://localhost:3001`
   - `base_url_quiz`: `http://localhost:3002`
   - `base_url_game`: `http://localhost:3003`

2. **Tests automatiques** : Ajoutez des scripts de test dans l'onglet "Tests" :
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response has question", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('question');
   });
   ```

3. **Pré-requêtes** : Utilisez l'onglet "Pre-request Script" pour automatiser certaines actions.

---

## 📝 Notes

- Tous les endpoints retournent du JSON
- Les IDs sont générés automatiquement (format : `q` + timestamp)
- Les réponses sont sensibles à la casse pour les comparaisons
- MongoDB est utilisé en production, JSON en fallback


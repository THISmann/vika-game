# Documentation Swagger - API Gateway

L'API Gateway expose maintenant une documentation Swagger centralisée qui inclut **tous les endpoints** de tous les services.

## 📚 Accès à la documentation

**URL principale :** http://localhost:3000/api-docs

Cette documentation centralisée inclut :
- ✅ Tous les endpoints Auth Service
- ✅ Tous les endpoints Quiz Service  
- ✅ Tous les endpoints Game Service
- ✅ Tous les endpoints Telegram Bot
- ✅ Les endpoints de l'API Gateway

## 🎯 Endpoints documentés

### Auth Service (`/auth`)

#### Admin
- `POST /auth/admin/login` - Connexion admin
- `GET /auth/test` - Test endpoint

#### Players
- `POST /auth/players/register` - Inscription d'un joueur
- `GET /auth/players` - Liste de tous les joueurs
- `GET /auth/players/:id` - Détails d'un joueur

### Quiz Service (`/quiz`)

#### Admin
- `POST /quiz/create` - Créer une question
- `PUT /quiz/:id` - Modifier une question
- `DELETE /quiz/:id` - Supprimer une question
- `GET /quiz/full` - Liste complète des questions (avec réponses)

#### Public
- `GET /quiz/all` - Liste des questions (sans réponses)
- `GET /quiz/questions` - Alias pour `/quiz/all`

### Game Service (`/game`)

#### Game Management (Admin)
- `POST /game/start` - Démarrer le jeu
- `POST /game/next` - Question suivante
- `POST /game/end` - Terminer le jeu
- `DELETE /game/delete` - Réinitialiser l'état du jeu
- `GET /game/results` - Résultats des questions

#### Answers
- `POST /game/answer` - Soumettre une réponse

#### Scores
- `GET /game/score/:playerId` - Score d'un joueur
- `GET /game/leaderboard` - Classement

#### State
- `GET /game/state` - État actuel du jeu
- `GET /game/code` - Code d'accès au jeu
- `POST /game/verify-code` - Vérifier le code d'accès

#### Players
- `GET /game/players/count` - Nombre de joueurs connectés
- `GET /game/players` - Liste des joueurs connectés

### Telegram Bot (`/telegram`)

- Tous les endpoints du Telegram Bot sont proxifiés

### API Gateway (`/`)

- `GET /health` - Health check
- `GET /test` - Test endpoint

## 🔧 Utilisation

### Interface Swagger UI

1. Accédez à http://localhost:3000/api-docs
2. Explorez tous les endpoints de tous les services
3. Testez les endpoints directement depuis l'interface
4. Consultez les schémas de données et les exemples

### Avantages de la documentation centralisée

- ✅ **Une seule URL** pour accéder à toute la documentation
- ✅ **Vue d'ensemble** de tous les services
- ✅ **Schémas partagés** entre les services
- ✅ **Test unifié** de tous les endpoints
- ✅ **Documentation à jour** automatiquement

## 📋 Comparaison avec les documentations individuelles

| Service | URL individuelle | URL via API Gateway |
|---------|------------------|---------------------|
| Auth Service | http://localhost:3001/api-docs | http://localhost:3000/api-docs (section Auth) |
| Quiz Service | http://localhost:3002/api-docs | http://localhost:3000/api-docs (section Quiz) |
| Game Service | http://localhost:3003/api-docs | http://localhost:3000/api-docs (section Game) |
| **API Gateway** | **http://localhost:3000/api-docs** | **http://localhost:3000/api-docs** |

## 🎨 Organisation

La documentation est organisée par tags :
- **Auth** - Endpoints d'authentification et de gestion des joueurs
- **Quiz** - Endpoints de gestion des questions
- **Game** - Endpoints de gestion du jeu
- **Telegram** - Endpoints du bot Telegram
- **Gateway** - Endpoints de l'API Gateway

## 📖 Schémas de données

Tous les schémas sont documentés dans la section "Schemas" :
- `Player` - Modèle de joueur
- `Question` - Modèle de question
- `AnswerRequest` / `AnswerResponse` - Requêtes/réponses pour les réponses
- `Score` - Modèle de score
- `GameState` - État du jeu
- Et bien plus...

## ✅ Checklist

- [x] Configuration Swagger pour API Gateway créée
- [x] Tous les endpoints Auth documentés
- [x] Tous les endpoints Quiz documentés
- [x] Tous les endpoints Game documentés
- [x] Endpoints Telegram documentés
- [x] Endpoints Gateway documentés
- [x] Schémas de données définis
- [x] Interface Swagger UI intégrée
- [x] Documentation centralisée accessible

## 🔄 Mise à jour

Pour ajouter ou modifier la documentation :

1. Modifiez les annotations JSDoc dans `node/api-gateway/src/routes/gateway.routes.js`
2. Ajoutez ou modifiez les schémas dans `node/api-gateway/src/config/swagger.js`
3. Redémarrez l'API Gateway pour voir les changements

## 📚 Références

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)



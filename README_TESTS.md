# 🧪 Guide Rapide : Tests des Microservices

## 🚀 Démarrage Rapide

### 1. Installer les Dépendances

```bash
# À la racine
npm install

# Pour chaque service (si nécessaire)
cd node/auth-service && npm install
cd ../quiz-service && npm install
cd ../game-service && npm install
```

### 2. Exécuter les Tests

#### Tests d'un Service

```bash
# Auth Service
cd node/auth-service
npm test

# Quiz Service
cd node/quiz-service
npm test

# Game Service
cd node/game-service
npm test
```

#### Tous les Services

```bash
# Depuis la racine
npm run test:all

# Avec couverture de code
npm run test:all:coverage
```

#### Tests d'Intégration

**⚠️ Important : Les services doivent être démarrés !**

```bash
# Terminal 1: Démarrer les services
cd node/auth-service && npm start &
cd node/quiz-service && npm start &
cd node/game-service && npm start &

# Terminal 2: Exécuter les tests
npm run test:integration
```

## 📋 Endpoints Critiques Testés

### ✅ Auth Service
- `POST /auth/players/register` - Inscription joueur
- `GET /auth/players` - Liste des joueurs
- `GET /auth/players/:id` - Détails joueur
- `POST /auth/admin/login` - Connexion admin

### ✅ Quiz Service
- `GET /quiz/all` - Questions publiques
- `GET /quiz/full` - Questions complètes
- `POST /quiz/create` - Créer question
- `PUT /quiz/:id` - Modifier question
- `DELETE /quiz/:id` - Supprimer question

### ✅ Game Service
- `POST /game/answer` - Soumettre réponse
- `GET /game/score/:playerId` - Score joueur
- `GET /game/leaderboard` - Classement
- `POST /game/start` - Démarrer jeu
- `POST /game/verify-code` - Vérifier code
- WebSocket `register` - Enregistrement
- WebSocket `game:started` - Démarrage
- WebSocket `question:next` - Question

## 📊 Vérifier la Couverture

```bash
# Pour un service
cd node/auth-service
npm test -- --coverage

# Pour tous les services
npm run test:all:coverage
```

## 🔍 Debugging

### Voir les Logs Détaillés

```bash
npm test -- --verbose
```

### Tester un Fichier Spécifique

```bash
npm test -- auth.controller.test.js
```

### Mode Watch (Re-exécute à chaque changement)

```bash
npm run test:watch
```

## 📚 Documentation Complète

- **Guide complet** : `docs/TESTING_MICROSERVICES.md`
- **Guide d'implémentation** : `docs/IMPLEMENTATION_TESTS.md`

## ✅ Checklist de Vérification

Avant de déployer, vérifiez que :

- [ ] Tous les tests unitaires passent
- [ ] Tous les tests d'intégration passent
- [ ] La couverture de code est > 60%
- [ ] Les endpoints critiques sont testés
- [ ] Les WebSockets sont testés
- [ ] Les cas d'erreur sont testés


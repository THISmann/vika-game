# ⚡ Guide Rapide : Tests des Microservices

## 🎯 Objectif

S'assurer que tous les microservices fonctionnent correctement en testant les endpoints critiques.

## 📦 Installation (Une Seule Fois)

```bash
# Installer toutes les dépendances de test
./scripts/install-test-deps.sh
```

## 🧪 Exécution des Tests

### Option 1 : Tous les Services (Recommandé)

```bash
# Depuis la racine du projet
npm run test:all
```

### Option 2 : Un Service à la Fois

```bash
# Auth Service
cd node/auth-service && npm test

# Quiz Service
cd node/quiz-service && npm test

# Game Service
cd node/game-service && npm test
```

### Option 3 : Tests d'Intégration (Services Réels)

**⚠️ Les services doivent être démarrés !**

```bash
# Terminal 1: Démarrer les services
cd node/auth-service && npm start &
cd node/quiz-service && npm start &
cd node/game-service && npm start &

# Terminal 2: Exécuter les tests
npm run test:integration
```

## 📊 Vérifier la Couverture

```bash
# Avec rapport de couverture
npm run test:all:coverage
```

Cela génère un rapport dans `coverage/` montrant :
- Pourcentage de code testé
- Lignes non couvertes
- Fonctions non testées

## ✅ Checklist des Endpoints Critiques

### Auth Service ✅
- [x] `POST /auth/players/register`
- [x] `GET /auth/players`
- [x] `GET /auth/players/:id`
- [x] `POST /auth/admin/login`

### Quiz Service ✅
- [x] `GET /quiz/all`
- [x] `GET /quiz/full`
- [x] `POST /quiz/create`
- [x] `PUT /quiz/:id`
- [x] `DELETE /quiz/:id`

### Game Service ✅
- [x] `POST /game/answer`
- [x] `GET /game/score/:playerId`
- [x] `GET /game/leaderboard`
- [x] `POST /game/start`
- [x] `POST /game/verify-code`
- [x] WebSocket `register`
- [x] WebSocket `game:started`
- [x] WebSocket `question:next`

## 🔍 Exemple de Sortie

```
🧪 ========== TESTS DES MICROSERVICES ==========

📦 Test du service: auth-service
▶️  Exécution: npm test
✅ Tests de auth-service réussis

📦 Test du service: quiz-service
▶️  Exécution: npm test
✅ Tests de quiz-service réussis

📦 Test du service: game-service
▶️  Exécution: npm test
✅ Tests de game-service réussis

📊 ========== RÉSUMÉ ==========
✅ Réussis: 3
❌ Échoués: 0

🎉 Tous les tests sont passés !
```

## 🐛 Résolution de Problèmes

### Les tests échouent

1. **Vérifier que les dépendances sont installées** :
   ```bash
   ./scripts/install-test-deps.sh
   ```

2. **Vérifier les logs d'erreur** :
   ```bash
   npm test -- --verbose
   ```

3. **Vérifier que les mocks sont corrects**

### Les tests d'intégration échouent

1. **Vérifier que les services sont démarrés** :
   ```bash
   curl http://localhost:3001/test
   curl http://localhost:3002/test
   curl http://localhost:3003/test
   ```

2. **Vérifier les ports** : Les services doivent être sur 3001, 3002, 3003

## 📚 Documentation Complète

- **Guide détaillé** : `docs/TESTING_MICROSERVICES.md`
- **Guide d'implémentation** : `docs/IMPLEMENTATION_TESTS.md`


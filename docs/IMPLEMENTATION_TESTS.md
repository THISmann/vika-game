# 🚀 Guide d'Implémentation des Tests

## 📋 Vue d'ensemble

Ce guide explique comment implémenter et exécuter des tests pour s'assurer que vos microservices fonctionnent correctement.

## 🎯 Objectifs des Tests

1. **Vérifier que les endpoints fonctionnent** : Chaque endpoint doit répondre correctement
2. **Valider les données** : Les réponses doivent avoir le bon format
3. **Tester les cas d'erreur** : Gestion des erreurs (404, 400, 500, etc.)
4. **Tester l'intégration** : Les services doivent fonctionner ensemble
5. **Tester les WebSockets** : Les événements doivent être émis et reçus

## 📁 Structure des Tests

```
gameV2/
├── node/
│   ├── auth-service/
│   │   ├── __tests__/
│   │   │   ├── unit/                    # Tests unitaires
│   │   │   │   └── auth.controller.test.js
│   │   │   └── integration/             # Tests d'intégration
│   │   └── jest.config.js
│   ├── quiz-service/
│   │   └── __tests__/
│   └── game-service/
│       └── __tests__/
├── tests/
│   └── integration/                      # Tests inter-services
│       └── api-endpoints.test.js
└── scripts/
    └── test-all-services.sh              # Script pour tous les tests
```

## 🔧 Installation

### 1. Installer les dépendances de test

```bash
# À la racine du projet
npm install

# Pour chaque service (si nécessaire)
cd node/auth-service && npm install --save-dev jest supertest
cd ../quiz-service && npm install --save-dev jest supertest
cd ../game-service && npm install --save-dev jest supertest
```

### 2. Configurer Jest

Chaque service a son propre `jest.config.js`. Voir les exemples créés.

## 🧪 Types de Tests

### 1. Tests Unitaires

Testent une fonction isolément, sans dépendances externes.

**Exemple :** `node/auth-service/__tests__/auth.controller.test.js`

```javascript
describe('registerPlayer', () => {
  it('devrait créer un joueur avec un nom valide', async () => {
    // Test isolé avec mocks
  })
})
```

### 2. Tests d'Intégration

Testent l'interaction entre composants (API, DB, etc.).

**Exemple :** `node/game-service/__tests__/game.controller.integration.test.js`

```javascript
describe('POST /game/answer', () => {
  it('devrait accepter une réponse et calculer le score', async () => {
    // Test avec vraie base de données (ou mock réaliste)
  })
})
```

### 3. Tests E2E (End-to-End)

Testent le flux complet avec les services réels.

**Exemple :** `tests/integration/api-endpoints.test.js`

```javascript
describe('Flux Complet', () => {
  it('devrait permettre le flux complet', async () => {
    // Test avec services réels démarrés
  })
})
```

## 🚀 Exécution des Tests

### Tests d'un Service Individuel

```bash
# Auth Service
cd node/auth-service
npm test

# Avec couverture
npm test -- --coverage

# Mode watch (re-exécute à chaque changement)
npm run test:watch
```

### Tous les Services

```bash
# Depuis la racine
npm run test:all

# Avec couverture
npm run test:all:coverage

# Mode watch
./scripts/test-all-services.sh --watch
```

### Tests d'Intégration

**Important :** Les services doivent être démarrés !

```bash
# Terminal 1: Démarrer les services
cd node/auth-service && npm start &
cd node/quiz-service && npm start &
cd node/game-service && npm start &

# Terminal 2: Exécuter les tests
npm run test:integration
```

## 📊 Endpoints Critiques à Tester

### ✅ Checklist Auth Service

- [ ] `POST /auth/players/register` - Création joueur
- [ ] `GET /auth/players` - Liste joueurs
- [ ] `GET /auth/players/:id` - Détails joueur
- [ ] `POST /auth/admin/login` - Connexion admin
- [ ] Gestion des erreurs (409, 400, 404)

### ✅ Checklist Quiz Service

- [ ] `GET /quiz/all` - Questions publiques
- [ ] `GET /quiz/full` - Questions complètes
- [ ] `POST /quiz/create` - Création question
- [ ] `PUT /quiz/:id` - Modification question
- [ ] `DELETE /quiz/:id` - Suppression question
- [ ] Validation des données

### ✅ Checklist Game Service

- [ ] `POST /game/answer` - Soumission réponse
- [ ] `GET /game/score/:playerId` - Score joueur
- [ ] `GET /game/leaderboard` - Classement
- [ ] `POST /game/start` - Démarrage jeu
- [ ] `POST /game/next` - Question suivante
- [ ] `GET /game/state` - État du jeu
- [ ] `POST /game/verify-code` - Vérification code
- [ ] WebSocket `register` - Enregistrement
- [ ] WebSocket `game:started` - Démarrage
- [ ] WebSocket `question:next` - Question

## 🎨 Bonnes Pratiques

### 1. Nommer les Tests Clairement

```javascript
// ❌ Mauvais
it('test 1', () => {})

// ✅ Bon
it('devrait créer un joueur avec un nom valide', () => {})
it('devrait rejeter un nom déjà utilisé (409)', () => {})
```

### 2. Structure AAA (Arrange-Act-Assert)

```javascript
it('devrait calculer le score correctement', async () => {
  // Arrange (Préparer)
  const playerId = 'p123'
  const questionId = 'q123'
  const correctAnswer = 'Paris'
  
  // Act (Agir)
  const result = await submitAnswer(playerId, questionId, correctAnswer)
  
  // Assert (Vérifier)
  expect(result.correct).toBe(true)
  expect(result.score).toBeGreaterThan(0)
})
```

### 3. Isoler les Tests

Chaque test doit être indépendant et ne pas dépendre d'un autre.

```javascript
beforeEach(() => {
  // Réinitialiser l'état avant chaque test
  jest.clearAllMocks()
  // Reset DB si nécessaire
})
```

### 4. Tester les Cas Limites

```javascript
// Cas normaux
it('devrait accepter un nom valide', () => {})

// Cas limites
it('devrait rejeter un nom vide', () => {})
it('devrait rejeter un nom trop long', () => {})
it('devrait rejeter un nom avec caractères spéciaux', () => {})
```

### 5. Mock les Dépendances Externes

```javascript
// Mock MongoDB
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}))

// Mock API externe
jest.mock('axios')
axios.get.mockResolvedValue({ data: mockData })
```

## 🔍 Debugging des Tests

### Voir les Logs Détaillés

```bash
# Mode verbose
npm test -- --verbose

# Un seul test
npm test -- --testNamePattern="devrait créer un joueur"
```

### Tests en Mode Debug

```javascript
// Dans votre test
it('devrait faire X', async () => {
  console.log('Debug info:', someVariable)
  // Votre test
})
```

### Utiliser `--only` pour Tester un Fichier

```bash
npm test -- auth.controller.test.js
```

## 📈 Métriques de Couverture

### Objectifs

- **Endpoints critiques** : > 80%
- **Code général** : > 60%
- **Fonctions utilitaires** : > 90%

### Vérifier la Couverture

```bash
npm test -- --coverage
```

Cela génère un rapport dans `coverage/` avec :
- Pourcentage de lignes couvertes
- Pourcentage de fonctions couvertes
- Lignes non couvertes

## 🔄 CI/CD Integration

### GitHub Actions

Créer `.github/workflows/tests.yml` :

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test:all
      - run: npm run test:all:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🎯 Prochaines Étapes

1. ✅ Installer les dépendances de test
2. ✅ Configurer Jest pour chaque service
3. ✅ Créer les tests unitaires pour les endpoints critiques
4. ✅ Créer les tests d'intégration
5. ✅ Configurer CI/CD
6. ✅ Maintenir > 60% de couverture


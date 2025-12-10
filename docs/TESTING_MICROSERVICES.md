# 🧪 Guide Complet : Tests des Microservices

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de Tests](#architecture-de-tests)
3. [Tests Unitaires](#tests-unitaires)
4. [Tests d'Intégration](#tests-dintégration)
5. [Tests E2E](#tests-e2e)
6. [Exécution des Tests](#exécution-des-tests)
7. [CI/CD Integration](#cicd-integration)

## 🎯 Vue d'ensemble

### Types de Tests

1. **Tests Unitaires** : Testent des fonctions individuelles isolément
2. **Tests d'Intégration** : Testent l'interaction entre composants
3. **Tests E2E** : Testent le flux complet de bout en bout
4. **Tests de Performance** : Vérifient les temps de réponse

### Outils Utilisés

- **Jest** : Tests unitaires et d'intégration (Backend)
- **Vitest** : Tests unitaires (Frontend)
- **Supertest** : Tests d'API HTTP
- **Socket.io-client** : Tests WebSocket

## 🏗️ Architecture de Tests

```
gameV2/
├── node/
│   ├── auth-service/
│   │   ├── __tests__/
│   │   │   ├── unit/              # Tests unitaires
│   │   │   ├── integration/        # Tests d'intégration
│   │   │   └── e2e/               # Tests E2E
│   │   └── jest.config.js
│   ├── quiz-service/
│   │   └── __tests__/
│   ├── game-service/
│   │   └── __tests__/
│   └── shared/
│       └── __tests__/
├── tests/
│   ├── integration/                # Tests inter-services
│   ├── e2e/                        # Tests end-to-end
│   └── performance/                # Tests de performance
└── scripts/
    └── test-all.sh                 # Script pour tous les tests
```

## 🔬 Tests Unitaires

### Structure d'un Test Unitaire

```javascript
describe('Nom du Module', () => {
  describe('Nom de la Fonction', () => {
    it('devrait faire X quand Y', () => {
      // Arrange (Préparer)
      const input = 'test'
      
      // Act (Agir)
      const result = functionToTest(input)
      
      // Assert (Vérifier)
      expect(result).toBe('expected')
    })
  })
})
```

### Bonnes Pratiques

1. **Un test = Une assertion principale**
2. **Nommer les tests clairement** : "devrait retourner X quand Y"
3. **Isoler les tests** : Chaque test doit être indépendant
4. **Mock les dépendances externes** : DB, API, etc.
5. **Tester les cas limites** : Erreurs, valeurs nulles, etc.

## 🔗 Tests d'Intégration

### Tests d'API HTTP

```javascript
const request = require('supertest')
const app = require('../server')

describe('POST /auth/players/register', () => {
  it('devrait créer un nouveau joueur', async () => {
    const response = await request(app)
      .post('/auth/players/register')
      .send({ name: 'TestPlayer' })
      .expect(201)
    
    expect(response.body).toHaveProperty('id')
    expect(response.body.name).toBe('TestPlayer')
  })
})
```

### Tests WebSocket

```javascript
const io = require('socket.io-client')

describe('WebSocket Events', () => {
  it('devrait enregistrer un joueur et recevoir game:code', (done) => {
    const socket = io('http://localhost:3003', {
      path: '/socket.io',
      transports: ['polling']
    })
    
    socket.on('connect', () => {
      socket.emit('register', 'test-player-123')
    })
    
    socket.on('game:code', (data) => {
      expect(data).toHaveProperty('gameCode')
      socket.disconnect()
      done()
    })
  })
})
```

## 🚀 Tests E2E

### Scénario Complet

```javascript
describe('Flux Complet de Jeu', () => {
  it('devrait permettre à un joueur de s\'inscrire et jouer', async () => {
    // 1. Créer un joueur
    const player = await createPlayer('TestPlayer')
    
    // 2. Se connecter au WebSocket
    const socket = await connectWebSocket()
    
    // 3. Enregistrer le joueur
    await registerPlayer(socket, player.id)
    
    // 4. Démarrer le jeu (admin)
    await startGame()
    
    // 5. Vérifier que le joueur reçoit la question
    const question = await waitForQuestion(socket)
    expect(question).toBeDefined()
    
    // 6. Répondre à la question
    await submitAnswer(player.id, question.id, 'answer')
    
    // 7. Vérifier le score
    const score = await getScore(player.id)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})
```

## 📊 Endpoints Critiques à Tester

### Auth Service

- ✅ `POST /auth/players/register` - Inscription joueur
- ✅ `GET /auth/players` - Liste des joueurs
- ✅ `GET /auth/players/:id` - Détails joueur
- ✅ `POST /auth/admin/login` - Connexion admin

### Quiz Service

- ✅ `GET /quiz/all` - Questions publiques
- ✅ `GET /quiz/full` - Questions complètes
- ✅ `POST /quiz/create` - Créer question
- ✅ `PUT /quiz/:id` - Modifier question
- ✅ `DELETE /quiz/:id` - Supprimer question

### Game Service

- ✅ `POST /game/answer` - Soumettre réponse
- ✅ `GET /game/score/:playerId` - Score joueur
- ✅ `GET /game/leaderboard` - Classement
- ✅ `POST /game/start` - Démarrer jeu
- ✅ `POST /game/next` - Question suivante
- ✅ WebSocket `register` - Enregistrement joueur
- ✅ WebSocket `game:started` - Démarrage jeu
- ✅ WebSocket `question:next` - Question suivante

## 🛠️ Configuration

### Jest Configuration (Backend)

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ]
}
```

### Vitest Configuration (Frontend)

Déjà configuré dans `vue/front/vitest.config.js`

## 📈 Métriques de Test

### Couverture de Code

- **Objectif** : > 80% pour les endpoints critiques
- **Minimum** : > 60% pour tout le code

### Types de Tests

- **Unitaires** : 70% des tests
- **Intégration** : 20% des tests
- **E2E** : 10% des tests

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:all
      - run: npm run test:coverage
```

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Socket.io Testing](https://socket.io/docs/v4/testing/)


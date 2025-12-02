# Guide des Tests Unitaires

Ce document décrit les tests unitaires disponibles pour le projet IntelectGame V2.

## Structure des Tests

### Backend Tests

#### Game Service (`node/game-service/__tests__/`)

- **gameState.test.js** : Tests pour la gestion de l'état du jeu
  - Initialisation de l'état
  - Gestion des joueurs connectés
  - Démarrage et arrêt du jeu
  - Gestion des questions
  - Sauvegarde des réponses et résultats

#### Quiz Service (`node/quiz-service/__tests__/`)

- **quiz.controller.test.js** : Tests pour le contrôleur de quiz
  - Ajout de questions
  - Récupération de questions (avec/sans réponses)
  - Mise à jour de questions
  - Suppression de questions
  - Validation des champs requis

### Frontend Tests

#### Components Tests (`vue/front/src/components/__tests__/`)

- **QuizPlay.test.js** : Tests pour le composant de jeu
  - Affichage de l'état de chargement
  - Affichage de l'attente du début du jeu
  - Affichage des questions
  - Soumission des réponses
  - Gestion des erreurs

- **Leaderboard.test.js** : Tests pour le composant de classement
  - Chargement du classement
  - Affichage des joueurs
  - Mise à jour en temps réel via WebSocket
  - État vide

## Exécution des Tests

### Backend Tests

Pour exécuter les tests backend, vous devez d'abord installer les dépendances de test :

```bash
# Game Service
cd node/game-service
npm install --save-dev jest

# Quiz Service
cd node/quiz-service
npm install --save-dev jest

# Auth Service
cd node/auth-service
npm install --save-dev jest
```

Ensuite, ajoutez les scripts de test dans les `package.json` :

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

Exécutez les tests :

```bash
npm test
```

### Frontend Tests

Les tests frontend utilisent Vitest (déjà configuré) :

```bash
cd vue/front
npm run test:unit
```

Pour exécuter en mode watch :

```bash
npm run test:unit -- --watch
```

## Couverture des Tests

Les tests couvrent :

1. **Gestion d'état du jeu** : Toutes les fonctions de base
2. **Contrôleurs backend** : CRUD des questions, gestion des scores
3. **Composants Vue** : Affichage, interactions utilisateur, WebSocket
4. **Validation** : Champs requis, états invalides

## Ajout de Nouveaux Tests

### Pour Backend

1. Créez un fichier `*.test.js` dans le dossier `__tests__/` du service
2. Utilisez Jest comme framework de test
3. Mockez les dépendances externes (axios, fs, etc.)
4. Testez les cas de succès et d'erreur

### Pour Frontend

1. Créez un fichier `*.test.js` dans `vue/front/src/components/__tests__/`
2. Utilisez Vitest et Vue Test Utils
3. Mockez axios et socket.io-client
4. Testez les interactions utilisateur et les états du composant

## Exemples de Tests

### Test Backend

```javascript
test('should add connected player', () => {
  gameState.addConnectedPlayer('player1');
  expect(gameState.getConnectedPlayersCount()).toBe(1);
});
```

### Test Frontend

```javascript
it('should display question when game started', async () => {
  axios.get.mockResolvedValue({ data: { isStarted: true } });
  const wrapper = mount(QuizPlay);
  expect(wrapper.text()).toContain('Test question?');
});
```

## Notes

- Les tests utilisent des fichiers de test séparés pour éviter de modifier les données de production
- Les mocks sont utilisés pour isoler les tests des dépendances externes
- Les tests doivent être rapides et indépendants les uns des autres




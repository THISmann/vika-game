# Vérification complète des endpoints

## Routes Backend

### Auth Service (`/auth/*`)
- `POST /auth/admin/login` ✅
- `POST /auth/players/register` ✅
- `GET /auth/players` ✅
- `GET /auth/players/:id` ✅
- `GET /auth/verify-token` ✅

### Quiz Service (`/quiz/*`)
- `GET /quiz/all` ✅ (public)
- `GET /quiz/questions` ✅ (public, alias de /all)
- `GET /quiz/full` ✅ (admin)
- `POST /quiz/create` ✅ (admin)
- `PUT /quiz/:id` ✅ (admin)
- `DELETE /quiz/:id` ✅ (admin)
- `GET /quiz/verify/:id` ✅ (public)

### Game Service (`/game/*`)
- `POST /game/answer` ✅ (public)
- `GET /game/score/:playerId` ✅ (public)
- `GET /game/leaderboard` ✅ (public)
- `GET /game/state` ✅ (public)
- `GET /game/code` ✅ (public)
- `POST /game/verify-code` ✅ (public)
- `GET /game/players/count` ✅ (public)
- `GET /game/players` ✅ (public)
- `POST /game/start` ✅ (admin)
- `POST /game/next` ✅ (admin)
- `POST /game/end` ✅ (admin)
- `DELETE /game/delete` ✅ (admin)
- `GET /game/results` ✅ (public)

## Nginx Rewrites

### Auth Service
- Frontend: `/api/auth/admin/login` → Nginx rewrite → `/auth/admin/login` → Backend ✅
- Frontend: `/api/auth/players/register` → Nginx rewrite → `/auth/players/register` → Backend ✅

### Quiz Service
- Frontend: `/api/quiz/all` → Nginx rewrite → `/quiz/all` → Backend ✅
- Frontend: `/api/quiz/create` → Nginx rewrite → `/quiz/create` → Backend ✅
- Frontend: `/api/quiz/:id` → Nginx rewrite → `/quiz/:id` → Backend ✅

### Game Service
- Frontend: `/api/game/start` → Nginx rewrite → `/game/start` → Backend ✅
- Frontend: `/api/game/answer` → Nginx rewrite → `/game/answer` → Backend ✅
- Frontend: `/api/game/state` → Nginx rewrite → `/game/state` → Backend ✅

## Configuration Frontend

### En Production
- `API_CONFIG.AUTH_SERVICE` = `/api/auth`
- `API_CONFIG.QUIZ_SERVICE` = `/api/quiz`
- `API_CONFIG.GAME_SERVICE` = `/api/game`

### URLs construites en production

#### Auth
- `API_URLS.auth.login` = `/api/auth/admin/login` ✅
- `API_URLS.auth.register` = `/api/auth/players/register` ✅
- `API_URLS.auth.players` = `/api/auth/players` ✅

#### Quiz
- `API_URLS.quiz.all` = `/api/quiz/all` ✅
- `API_URLS.quiz.questions` = `/api/quiz/questions` ✅
- `API_URLS.quiz.full` = `/api/quiz/full` ✅
- `API_URLS.quiz.create` = `/api/quiz/create` ✅
- `API_URLS.quiz.update(id)` = `/api/quiz/${id}` ✅
- `API_URLS.quiz.delete(id)` = `/api/quiz/${id}` ✅

#### Game
- `API_URLS.game.answer` = `/api/game/answer` ✅
- `API_URLS.game.score(playerId)` = `/api/game/score/${playerId}` ✅
- `API_URLS.game.leaderboard` = `/api/game/leaderboard` ✅
- `API_URLS.game.state` = `/api/game/state` ✅
- `API_URLS.game.code` = `/api/game/code` ✅
- `API_URLS.game.verifyCode` = `/api/game/verify-code` ✅
- `API_URLS.game.playersCount` = `/api/game/players/count` ✅
- `API_URLS.game.players` = `/api/game/players` ✅
- `API_URLS.game.start` = `/api/game/start` ✅
- `API_URLS.game.next` = `/api/game/next` ✅
- `API_URLS.game.end` = `/api/game/end` ✅
- `API_URLS.game.delete` = `/api/game/delete` ✅
- `API_URLS.game.results` = `/api/game/results` ✅

## Vérification des appels dans le code

### Services (`api.js`)
- ✅ `authService.login()` → utilise `API_URLS.auth.login`
- ✅ `quizService.getFullQuestions()` → utilise `API_URLS.quiz.full`
- ✅ `quizService.createQuestion()` → utilise `API_URLS.quiz.create`
- ✅ `quizService.updateQuestion()` → utilise `API_URLS.quiz.update(id)`
- ✅ `quizService.deleteQuestion()` → utilise `API_URLS.quiz.delete(id)`
- ✅ `gameService.startGame()` → utilise `API_URLS.game.start`
- ✅ `gameService.nextQuestion()` → utilise `API_URLS.game.next`
- ✅ `gameService.endGame()` → utilise `API_URLS.game.end`
- ✅ `gameService.deleteGame()` → utilise `API_URLS.game.delete`
- ✅ `gameService.getResults()` → utilise `API_URLS.game.results`

### Composants
- ✅ `AdminDashboard.vue` → utilise `API_URLS.quiz.all`, `gameService.*`, `apiClient.get(API_URLS.game.*)`
- ✅ `ManageQuestions.vue` → utilise `API_URLS.quiz.all`, `quizService.*`
- ✅ `PlayerRegister.vue` → utilise `API_URLS.auth.register`
- ✅ `QuizPlay.vue` → utilise `API_URLS.quiz.all`, `API_URLS.game.answer`, `API_URLS.game.results`
- ✅ `Leaderboard.vue` → utilise `API_URLS.game.leaderboard`

## Points critiques

1. ✅ **Pas de duplication de préfixes** : En production, on n'ajoute pas `/auth`, `/quiz`, `/game` car Nginx les ajoute via rewrite
2. ✅ **Tous les services utilisent `API_URLS`** : Plus de construction manuelle avec `API_CONFIG`
3. ✅ **Nginx rewrites corrects** : `/api/auth/(.*)` → `/auth/$1`, etc.

## Test de vérification

Dans la console du navigateur (production) :

```javascript
import { API_URLS, API_CONFIG } from '@/config/api'

// Vérifier les URLs de base
console.log('AUTH_SERVICE:', API_CONFIG.AUTH_SERVICE)  // Devrait être: /api/auth
console.log('QUIZ_SERVICE:', API_CONFIG.QUIZ_SERVICE)  // Devrait être: /api/quiz
console.log('GAME_SERVICE:', API_CONFIG.GAME_SERVICE)  // Devrait être: /api/game

// Vérifier les URLs complètes
console.log('Login:', API_URLS.auth.login)  // Devrait être: /api/auth/admin/login
console.log('Quiz all:', API_URLS.quiz.all)  // Devrait être: /api/quiz/all
console.log('Game start:', API_URLS.game.start)  // Devrait être: /api/game/start
console.log('Quiz delete:', API_URLS.quiz.delete('test-id'))  // Devrait être: /api/quiz/test-id
```

Toutes les URLs devraient être correctes et ne pas contenir de duplication de préfixes.


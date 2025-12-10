# 🔧 Correction : Erreur 401 (Unauthorized) sur les Routes Admin

## 🐛 Problème

Après s'être connecté en tant qu'admin, les requêtes vers les routes admin retournent une erreur `401 (Unauthorized)` car le token n'est pas envoyé dans les requêtes.

## ✅ Solution Appliquée

### Problème Identifié

Les composants admin (`AdminDashboard.vue`, `ManageQuestions.vue`) utilisaient `axios` directement au lieu d'utiliser `apiClient` qui ajoute automatiquement le token d'authentification.

### Corrections

1. **Import du service API** :
   ```javascript
   import apiClient, { gameService, quizService } from '@/services/api'
   ```

2. **Remplacement des appels axios** :
   - `axios.get()` → `apiClient.get()` ou `gameService.method()`
   - `axios.post()` → `apiClient.post()` ou `gameService.method()`
   - `axios.delete()` → `apiClient.delete()` ou `gameService.method()`

3. **Utilisation des services** :
   - `gameService.startGame()` au lieu de `axios.post(API_URLS.game.start)`
   - `gameService.nextQuestion()` au lieu de `axios.post(API_URLS.game.next)`
   - `gameService.endGame()` au lieu de `axios.post(API_URLS.game.end)`
   - `gameService.deleteGame()` au lieu de `axios.delete(API_URLS.game.delete)`
   - `quizService.createQuestion()` au lieu de `axios.post(API_URLS.quiz.create)`
   - `quizService.deleteQuestion()` au lieu de `axios.delete(API_URLS.quiz.delete)`

## 🔍 Comment ça Fonctionne

### apiClient avec Intercepteur

Le `apiClient` dans `vue/front/src/services/api.js` :
1. **Ajoute automatiquement le token** dans le header `Authorization: Bearer <token>`
2. **Gère les erreurs 401** en redirigeant vers `/admin/login`
3. **Récupère le token** depuis `localStorage.getItem('adminToken')`

### Exemple

**Avant** (sans authentification) :
```javascript
await axios.post(API_URLS.game.start, { questionDuration: 30 })
// ❌ Pas de token → 401 Unauthorized
```

**Après** (avec authentification) :
```javascript
await gameService.startGame(30)
// ✅ Token ajouté automatiquement → 200 OK
```

## 📋 Routes Protégées

Toutes ces routes nécessitent maintenant l'authentification :

- `POST /game/start` ✅
- `POST /game/next` ✅
- `POST /game/end` ✅
- `DELETE /game/delete` ✅
- `POST /quiz/create` ✅
- `PUT /quiz/:id` ✅
- `DELETE /quiz/:id` ✅
- `GET /quiz/full` ✅

## ✅ Vérification

1. **Se connecter** en tant qu'admin
2. **Vérifier dans la console** : Le token devrait être dans `localStorage.getItem('adminToken')`
3. **Tester une action admin** : Démarrer le jeu, créer une question, etc.
4. **Vérifier les requêtes** : Dans l'onglet Network, les requêtes devraient avoir le header `Authorization: Bearer <token>`

## 🔄 Si l'Erreur Persiste

1. **Vérifier que le token est stocké** :
   ```javascript
   // Dans la console du navigateur
   console.log('Token:', localStorage.getItem('adminToken'))
   ```

2. **Vérifier que le token est valide** :
   - Le token devrait être une chaîne base64
   - Vérifier qu'il n'est pas expiré (24h max)

3. **Se reconnecter** :
   - Aller sur `/admin/login`
   - Se reconnecter avec `admin` / `admin`
   - Le nouveau token sera stocké

4. **Vérifier les logs backend** :
   - Les logs devraient montrer si le token est reçu
   - Vérifier les erreurs d'authentification

## 📝 Note

Les routes publiques (comme `GET /quiz/all`) fonctionnent toujours sans authentification, mais `apiClient` peut être utilisé pour la cohérence.


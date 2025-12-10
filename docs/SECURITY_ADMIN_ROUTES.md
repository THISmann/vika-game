# 🔒 Sécurisation des Routes Admin

## 📋 Vue d'ensemble

Toutes les routes admin sont maintenant protégées par authentification. Seuls les administrateurs authentifiés peuvent accéder aux fonctionnalités admin.

## 🏗️ Architecture de Sécurité

### Backend

1. **Middleware d'authentification** : `node/shared/middleware/auth.middleware.js`
   - Vérifie le token JWT dans le header `Authorization: Bearer <token>`
   - Valide le token via le service d'authentification ou localement
   - Vérifie que le rôle est `admin`

2. **Routes protégées** :
   - **Quiz Service** : `/quiz/create`, `/quiz/:id` (PUT/DELETE), `/quiz/full`
   - **Game Service** : `/game/start`, `/game/next`, `/game/end`, `/game/delete`, `/game/results`

### Frontend

1. **Guards de route** : `vue/front/src/router/guards.js`
   - `adminGuard` : Vérifie l'authentification avant d'accéder aux routes admin
   - `loginGuard` : Redirige vers le dashboard si déjà authentifié

2. **Service API** : `vue/front/src/services/api.js`
   - Intercepteur axios pour ajouter automatiquement le token
   - Gestion des erreurs 401 (redirection vers login)

3. **Routes protégées** :
   - `/admin/dashboard`
   - `/admin/questions`

## 🔑 Authentification

### Flux d'authentification

1. **Connexion** :
   ```javascript
   POST /auth/admin/login
   Body: { username: 'admin', password: 'admin' }
   Response: { token: 'base64-encoded-token' }
   ```

2. **Stockage du token** :
   - Le token est stocké dans `localStorage` sous la clé `adminToken`
   - Un flag `admin: '1'` est aussi stocké pour vérification rapide

3. **Utilisation du token** :
   - Toutes les requêtes API incluent automatiquement : `Authorization: Bearer <token>`
   - Le token expire après 24 heures

### Vérification du token

Le backend vérifie le token de deux façons :

1. **Vérification locale** (si disponible) :
   - Décodage du token base64
   - Vérification du format `role-timestamp`
   - Vérification de l'expiration (24h)

2. **Vérification via API** :
   - Appel à `/auth/verify-token` si la vérification locale n'est pas disponible
   - Fallback si le service d'auth n'est pas accessible

## 🛡️ Routes Protégées

### Quiz Service

```javascript
// Créer une question (Admin seulement)
POST /quiz/create
Headers: { Authorization: 'Bearer <token>' }

// Modifier une question (Admin seulement)
PUT /quiz/:id
Headers: { Authorization: 'Bearer <token>' }

// Supprimer une question (Admin seulement)
DELETE /quiz/:id
Headers: { Authorization: 'Bearer <token>' }

// Récupérer toutes les questions avec réponses (Admin seulement)
GET /quiz/full
Headers: { Authorization: 'Bearer <token>' }
```

### Game Service

```javascript
// Démarrer le jeu (Admin seulement)
POST /game/start
Headers: { Authorization: 'Bearer <token>' }

// Question suivante (Admin seulement)
POST /game/next
Headers: { Authorization: 'Bearer <token>' }

// Terminer le jeu (Admin seulement)
POST /game/end
Headers: { Authorization: 'Bearer <token>' }

// Supprimer le jeu (Admin seulement)
DELETE /game/delete
Headers: { Authorization: 'Bearer <token>' }

// Résultats des questions (Admin seulement)
GET /game/results
Headers: { Authorization: 'Bearer <token>' }
```

## 🚫 Gestion des Erreurs

### Erreur 401 (Non authentifié)

```json
{
  "error": "Authentication required",
  "message": "No authorization header provided"
}
```

**Action frontend** : Redirection automatique vers `/admin/login`

### Erreur 403 (Accès refusé)

```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

**Action frontend** : Affichage d'un message d'erreur

### Token expiré

Le token expire après 24 heures. Le frontend vérifie l'expiration et redirige vers la page de login si nécessaire.

## 🔧 Configuration

### Variables d'environnement

```bash
# URL du service d'authentification (pour les autres services)
AUTH_SERVICE_URL=http://localhost:3001
```

### Durée de vie du token

Par défaut : **24 heures**

Modifiable dans `node/auth-service/utils/token.js` :
```javascript
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 heures
```

## ✅ Tests de Sécurité

### Test manuel

1. **Tester sans token** :
   ```bash
   curl -X POST http://localhost:3002/quiz/create \
     -H "Content-Type: application/json" \
     -d '{"question": "Test?", "choices": ["A", "B"], "answer": "A"}'
   # Devrait retourner 401
   ```

2. **Tester avec token valide** :
   ```bash
   # 1. Se connecter
   TOKEN=$(curl -X POST http://localhost:3001/auth/admin/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}' | jq -r '.token')
   
   # 2. Utiliser le token
   curl -X POST http://localhost:3002/quiz/create \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"question": "Test?", "choices": ["A", "B"], "answer": "A"}'
   # Devrait fonctionner
   ```

3. **Tester avec token invalide** :
   ```bash
   curl -X POST http://localhost:3002/quiz/create \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer invalid-token" \
     -d '{"question": "Test?", "choices": ["A", "B"], "answer": "A"}'
   # Devrait retourner 401
   ```

## 📝 Notes Importantes

1. **Le token est stocké dans localStorage** : Ne pas utiliser pour des données sensibles en production
2. **Le token expire après 24h** : L'utilisateur devra se reconnecter
3. **Les routes publiques** (`/quiz/all`, `/game/answer`, etc.) restent accessibles sans authentification
4. **Le frontend redirige automatiquement** vers `/admin/login` en cas d'erreur 401

## 🔄 Améliorations Futures

- [ ] Utiliser des tokens JWT standards (jsonwebtoken)
- [ ] Implémenter le refresh token
- [ ] Ajouter des rôles multiples (admin, moderator, etc.)
- [ ] Chiffrer le token dans localStorage
- [ ] Ajouter rate limiting pour les tentatives de connexion
- [ ] Logs d'audit pour les actions admin


# Fix: Erreur 401 lors du lancement du jeu

## Problème

Lorsqu'on clique sur "Lancer la partie" dans le dashboard admin, on est redirigé vers la page de connexion avec une erreur 401.

## Cause identifiée

Le `game-service` essaie d'appeler `/quiz/full` pour récupérer les questions, mais le `quiz-service` rejette le token avec une erreur 401 car :
1. Le `quiz-service` n'avait pas la variable d'environnement `AUTH_SERVICE_URL` définie
2. Il utilisait donc `http://localhost:3001` par défaut, qui ne fonctionne pas dans Docker
3. Le `quiz-service` ne pouvait pas contacter l'`auth-service` pour vérifier le token

## Corrections appliquées

### 1. Ajout de `AUTH_SERVICE_URL` au quiz-service (`docker-compose.yml`)

```yaml
quiz:
  environment:
    - AUTH_SERVICE_URL=http://auth:3001  # ✅ Ajouté
```

### 2. Amélioration des logs de débogage

- Logs détaillés dans `game.controller.js` pour voir le token transmis
- Logs détaillés dans les middlewares d'authentification pour voir les erreurs
- Logs pour identifier les problèmes de connexion entre services

### 3. Vérification du token avant l'appel

- Vérification que le token est présent avant d'appeler `/quiz/full`
- Message d'erreur clair si le token est manquant

## Test

1. Se connecter au dashboard admin
2. Cliquer sur "Lancer la partie"
3. Vérifier les logs :
   ```bash
   docker-compose logs game | grep -E "📋|❌|✅.*Fetched"
   docker-compose logs quiz | grep -E "401|Unauthorized|verify-token"
   ```

## Si le problème persiste

Vérifier :
1. Que le token est présent dans la requête (logs `🚀 Authorization header: Present`)
2. Que le quiz-service peut contacter l'auth-service (logs `❌ Auth service unavailable`)
3. Que le token n'est pas expiré (vérifier dans la console du navigateur)


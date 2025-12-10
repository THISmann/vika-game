# Fix : URLs par défaut dans Dockerfile

## Problème

Le Dockerfile utilisait des valeurs par défaut `http://localhost:3000/auth` qui étaient injectées au moment du build. En production Kubernetes, les variables d'environnement ne sont pas disponibles au build time, donc le code utilisait toujours `localhost:3000`.

## Cause

Les variables `VITE_*` doivent être disponibles au moment du build (pas au runtime). En production Kubernetes, les variables d'environnement du deployment ne sont pas disponibles au build time.

## Solution

Changer les valeurs par défaut dans le Dockerfile pour utiliser des URLs relatives (`/api/auth`, `/api/quiz`, `/api/game`) qui fonctionneront en production.

## Correction appliquée

Dans `vue/Dockerfile`, les valeurs par défaut ont été changées :

```dockerfile
# Avant
ARG VITE_AUTH_SERVICE_URL=http://localhost:3000/auth
ARG VITE_QUIZ_SERVICE_URL=http://localhost:3000/quiz
ARG VITE_GAME_SERVICE_URL=http://localhost:3000/game

# Après
ARG VITE_AUTH_SERVICE_URL=/api/auth
ARG VITE_QUIZ_SERVICE_URL=/api/quiz
ARG VITE_GAME_SERVICE_URL=/api/game
```

## Build pour différents environnements

### Production (Kubernetes)

Les valeurs par défaut (`/api/auth`) seront utilisées :

```bash
docker build -t thismann17/gamev2-frontend:latest -f vue/Dockerfile .
```

### Développement local avec Docker Compose

Si vous voulez utiliser l'API Gateway en développement, passez les build args :

```bash
docker build \
  --build-arg VITE_AUTH_SERVICE_URL=http://localhost:3000 \
  --build-arg VITE_QUIZ_SERVICE_URL=http://localhost:3000 \
  --build-arg VITE_GAME_SERVICE_URL=http://localhost:3000 \
  -t thismann17/gamev2-frontend:dev \
  -f vue/Dockerfile .
```

## Rebuild et redéployer

### 1. Rebuild l'image

```bash
cd vue
docker build -t thismann17/gamev2-frontend:latest -f Dockerfile .
docker push thismann17/gamev2-frontend:latest
```

### 2. Redéployer sur Kubernetes

```bash
kubectl rollout restart deployment/frontend -n intelectgame
kubectl rollout status deployment/frontend -n intelectgame --timeout=120s
```

### 3. Vérifier

1. Ouvrez le navigateur en production
2. Allez sur `/admin/login`
3. Ouvrez la console (F12) et vérifiez :
   ```
   🔑 Attempting login to: /api/auth/admin/login
   ```
4. L'erreur CORS ne devrait plus apparaître

## Note importante

Les variables d'environnement Kubernetes (`VITE_AUTH_SERVICE_URL`, etc.) dans le deployment ne sont **PAS** utilisées car elles ne sont pas disponibles au build time. Vite remplace `import.meta.env.VITE_*` au moment du build, pas au runtime.

Si vous devez changer les URLs après le build, vous devrez rebuild l'image avec les nouveaux build args.


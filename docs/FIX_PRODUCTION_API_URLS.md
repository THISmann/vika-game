# Fix : URLs API incorrectes en production

## Problème

En production, le frontend essaie de se connecter à `http://localhost:3000/auth/admin/login` au lieu d'utiliser l'URL relative `/api/auth/admin/login`.

## Cause

La logique de détection de `useApiGateway` était incorrecte. Elle vérifiait si les URLs contenaient `:3000` ou `localhost:3000`, mais en production Kubernetes, les variables d'environnement sont des chemins relatifs (`/api/auth`), donc la détection échouait.

## Solution

Corriger la logique pour :
1. Détecter correctement si on est en production
2. Utiliser les URLs relatives telles quelles si elles commencent par `/`
3. Ne pas considérer les URLs relatives comme un API Gateway

## Corrections appliquées

### 1. Correction de `getApiUrl()`

La fonction retourne maintenant correctement les URLs relatives en production :

```javascript
if (isProduction) {
  switch (service) {
    case 'auth':
      if (authUrl) {
        // Si c'est une URL relative, la retourner telle quelle
        if (authUrl.startsWith('/')) {
          return authUrl.replace(/\/$/, '')
        }
        return authUrl.replace(/\/$/, '')
      }
      return '/api/auth'
    // ...
  }
}
```

### 2. Correction de la détection `useApiGateway`

La détection vérifie maintenant que l'URL est absolue (commence par `http://` ou `https://`) :

```javascript
const useApiGateway = API_CONFIG.AUTH_SERVICE === API_CONFIG.QUIZ_SERVICE && 
                      API_CONFIG.QUIZ_SERVICE === API_CONFIG.GAME_SERVICE &&
                      API_CONFIG.AUTH_SERVICE !== '' &&
                      (API_CONFIG.AUTH_SERVICE.startsWith('http://') || API_CONFIG.AUTH_SERVICE.startsWith('https://')) &&
                      (API_CONFIG.AUTH_SERVICE.includes(':3000') || 
                       API_CONFIG.AUTH_SERVICE.includes('localhost:3000') ||
                       API_CONFIG.AUTH_SERVICE.includes('127.0.0.1:3000'))
```

## Vérification

### 1. Rebuild et redéployer le frontend

```bash
# Sur votre machine locale
cd vue/front
docker build -t thismann17/gamev2-frontend:latest .
docker push thismann17/gamev2-frontend:latest

# Sur votre VM
kubectl rollout restart deployment/frontend -n intelectgame
kubectl rollout status deployment/frontend -n intelectgame --timeout=120s
```

### 2. Tester la connexion

1. Ouvrez le navigateur en production
2. Allez sur `/admin/login`
3. Connectez-vous avec `admin` / `admin`
4. Ouvrez la console (F12) et vérifiez :
   ```
   🔑 Attempting login to: /api/auth/admin/login
   ✅ Login successful, token stored: ...
   ```
5. L'erreur CORS ne devrait plus apparaître

### 3. Vérifier les URLs dans la console

Dans la console du navigateur :
```javascript
import { API_CONFIG, API_URLS } from '@/config/api'
console.log('AUTH_SERVICE:', API_CONFIG.AUTH_SERVICE)
console.log('Login URL:', API_URLS.auth.login)
// En production, devrait être:
// AUTH_SERVICE: /api/auth
// Login URL: /api/auth/admin/login
```

## Si le problème persiste

### 1. Vérifier les variables d'environnement

Sur votre VM :
```bash
kubectl get deployment frontend -n intelectgame -o yaml | grep -A 5 "env:"
```

Vous devriez voir :
```yaml
env:
  - name: VITE_AUTH_SERVICE_URL
    value: "/api/auth"
  - name: VITE_QUIZ_SERVICE_URL
    value: "/api/quiz"
  - name: VITE_GAME_SERVICE_URL
    value: "/api/game"
```

### 2. Vérifier que le build utilise les bonnes variables

Les variables `VITE_*` sont injectées au moment du build, pas au runtime. Si vous modifiez les variables d'environnement, vous devez rebuild l'image Docker.

### 3. Vérifier les logs du build

Si les URLs sont toujours incorrectes, vérifiez les logs du build Docker pour voir quelles variables d'environnement ont été utilisées.


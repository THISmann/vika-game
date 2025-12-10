# Fix : adminToken non stocké en production

## Problème

En production, le `adminToken` n'est pas stocké dans le localStorage après la connexion, alors qu'en local il l'est.

## Cause

En production, l'URL de login est incorrecte :
- `API_CONFIG.AUTH_SERVICE` = `/api/auth` (chemin relatif)
- L'URL construite : `${API_CONFIG.AUTH_SERVICE}/auth/admin/login` = `/api/auth/auth/admin/login` ❌
- L'URL correcte devrait être : `/api/auth/admin/login` ✅

## Solution

Utiliser `API_URLS.auth.login` qui gère correctement les chemins pour production/dev au lieu de construire l'URL manuellement.

## Correction appliquée

Dans `vue/front/src/services/api.js`, la méthode `login()` utilise maintenant `API_URLS.auth.login` :

```javascript
async login(username, password) {
  // Utiliser l'URL complète depuis API_URLS qui gère correctement les chemins
  const loginUrl = API_URLS.auth.login
  
  console.log('🔑 Attempting login to:', loginUrl)
  
  const response = await axios.post(loginUrl, {
    username,
    password
  })
  
  if (response.data.token) {
    // Stocker le token et le flag admin
    localStorage.setItem('adminToken', response.data.token)
    localStorage.setItem('admin', '1')
    console.log('✅ Login successful, token stored:', response.data.token.substring(0, 20) + '...')
    console.log('✅ localStorage.getItem("adminToken"):', localStorage.getItem('adminToken'))
    return response.data.token
  }
  
  throw new Error('No token received')
}
```

## Vérification

### 1. Rebuild et redéployer le frontend

```bash
# Rebuild l'image Docker
cd vue/front
docker build -t thismann17/gamev2-frontend:latest .

# Push l'image
docker push thismann17/gamev2-frontend:latest

# Redéployer sur Kubernetes
kubectl rollout restart deployment/frontend -n intelectgame
```

### 2. Tester la connexion

1. Ouvrez le navigateur en production
2. Allez sur `/admin/login`
3. Connectez-vous avec `admin` / `admin`
4. Ouvrez la console (F12) et vérifiez :
   ```
   🔑 Attempting login to: /api/auth/admin/login
   ✅ Login successful, token stored: ...
   ✅ localStorage.getItem("adminToken"): ...
   ```
5. Vérifiez le localStorage :
   ```javascript
   localStorage.getItem('adminToken')
   // Devrait retourner le token
   ```

### 3. Vérifier que les requêtes incluent le token

1. Essayez de démarrer le jeu
2. Vérifiez dans la console :
   ```
   🔑 Adding auth token to request: /api/game/start Token present: true Token length: ...
   ```
3. Vérifiez les logs du game-service :
   ```bash
   kubectl logs -f -l app=game-service -n intelectgame | grep -i "AUTHENTICATION"
   ```
   Vous devriez voir :
   ```
   🔐 Authorization header: PRESENT
   ```

## Si le problème persiste

### 1. Vérifier que l'URL de login est correcte

Dans la console du navigateur, vérifiez :
```javascript
import { API_URLS } from '@/config/api'
console.log('Login URL:', API_URLS.auth.login)
// En production, devrait être: /api/auth/admin/login
```

### 2. Vérifier que la requête de login réussit

Dans l'onglet Network du navigateur :
1. Faites une connexion
2. Cliquez sur la requête `POST /api/auth/admin/login`
3. Vérifiez que la réponse contient `token` dans le body

### 3. Vérifier que le token est bien stocké

Dans la console du navigateur :
```javascript
// Après la connexion
console.log('adminToken:', localStorage.getItem('adminToken'))
console.log('admin:', localStorage.getItem('admin'))
// adminToken devrait contenir le token
// admin devrait être '1'
```

### 4. Vérifier les erreurs dans la console

Si la connexion échoue, vérifiez les erreurs dans la console du navigateur et les logs du serveur.


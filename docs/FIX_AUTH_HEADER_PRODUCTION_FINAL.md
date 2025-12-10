# Fix Final : Header Authorization non transmis en production

## Problème

Le header `Authorization` n'est pas transmis par Nginx vers les services backend, causant des erreurs 401 Unauthorized.

## Solution complète

### Étape 1 : Vérifier que le frontend envoie le header

**Dans le navigateur (F12 → Console)** :
```javascript
// Vérifier que le token est présent
console.log('Token:', localStorage.getItem('adminToken'))

// Les logs devraient montrer :
// 🔑 Adding auth token to request: /api/game/start Token present: true Token length: ...
```

**Dans le navigateur (F12 → Network)** :
1. Faites une requête (ex: démarrer le jeu)
2. Cliquez sur `POST /api/game/start`
3. Onglet **Headers** → **Request Headers**
4. Vérifiez que `Authorization: Bearer <token>` est présent

**Si le header n'est pas présent** :
- Reconnectez-vous au dashboard admin
- Vérifiez que le token est bien stocké après la connexion

### Étape 2 : Appliquer la configuration Nginx corrigée

**Sur votre VM** :
```bash
# 1. Appliquer la configuration
kubectl apply -f k8s/nginx-proxy-config.yaml

# 2. Forcer le redémarrage de Nginx
kubectl rollout restart deployment/nginx-proxy -n intelectgame

# 3. Attendre que Nginx soit prêt (jusqu'à 2 minutes)
kubectl rollout status deployment/nginx-proxy -n intelectgame --timeout=120s
```

### Étape 3 : Vérifier que la configuration est bien appliquée

**Sur votre VM** :
```bash
# Utiliser le script de vérification
./k8s/scripts/verify-auth-header-transmission.sh
```

**Ou manuellement** :
```bash
NGINX_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')

# Vérifier underscores_in_headers
kubectl exec -n intelectgame $NGINX_POD -- cat /etc/nginx/nginx.conf | grep "underscores_in_headers"
# Devrait afficher: underscores_in_headers on;

# Vérifier proxy_set_header Authorization
kubectl exec -n intelectgame $NGINX_POD -- cat /etc/nginx/nginx.conf | grep -A 2 "location /api/game" | grep "proxy_set_header Authorization"
# Devrait afficher: proxy_set_header Authorization $http_authorization;

# Tester la configuration
kubectl exec -n intelectgame $NGINX_POD -- nginx -t
# Devrait afficher: nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Étape 4 : Vérifier que le header est transmis

**Sur votre VM** :
```bash
# Surveiller les logs du game-service
kubectl logs -f -l app=game-service -n intelectgame | grep -i "AUTHENTICATION"
```

**Faites une requête depuis le navigateur** (ex: démarrer le jeu)

**Vous devriez voir** :
```
🔐 Authorization header: PRESENT
🔐 Authorization value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Si vous voyez toujours `MISSING`** :
- Vérifiez que Nginx a bien redémarré (étape 2)
- Vérifiez que la configuration est bien appliquée (étape 3)
- Vérifiez que le frontend envoie bien le header (étape 1)

## Configuration Nginx correcte

La configuration doit contenir :

```nginx
http {
    # CRITIQUE: Permettre les underscores dans les noms de headers
    underscores_in_headers on;
    
    server {
        location /api/game {
            # ...
            
            # CRITIQUE: Transmettre le header Authorization
            proxy_set_header Authorization $http_authorization;
            proxy_pass_request_headers on;
        }
    }
}
```

## Points critiques

1. **`underscores_in_headers on;`** : **OBLIGATOIRE** dans le bloc `http`
   - Sans cette directive, Nginx ignore les headers avec underscores
   - `Authorization` devient `$http_authorization` (avec underscore)

2. **`proxy_set_header Authorization $http_authorization;`** : **OBLIGATOIRE** dans chaque `location`
   - Force la transmission du header si présent
   - Si `$http_authorization` est vide, le header ne sera pas transmis (comportement normal)

3. **`proxy_pass_request_headers on;`** : **RECOMMANDÉ**
   - Transmet tous les headers de la requête originale
   - Mais `proxy_set_header` prend la priorité

4. **Ordre des directives** : L'ordre n'est pas critique, mais il est recommandé de mettre `proxy_set_header Authorization` avant `proxy_pass_request_headers`

## Scripts disponibles

1. **`k8s/scripts/apply-nginx-auth-fix-final.sh`** : Applique la correction et redémarre Nginx
2. **`k8s/scripts/verify-auth-header-transmission.sh`** : Vérifie que la configuration est correcte
3. **`k8s/scripts/diagnose-auth-header-issue.sh`** : Diagnostic complet du problème

## Si le problème persiste

### 1. Supprimer et recréer le pod Nginx

```bash
# Supprimer le pod (il sera recréé automatiquement)
kubectl delete pod -n intelectgame -l app=nginx-proxy

# Attendre que le nouveau pod soit prêt
kubectl get pods -n intelectgame -l app=nginx-proxy -w
```

### 2. Vérifier la ConfigMap

```bash
# Vérifier que la ConfigMap contient la bonne configuration
kubectl get configmap nginx-proxy-config -n intelectgame -o yaml | grep -A 3 "proxy_set_header Authorization"
```

### 3. Vérifier les événements Kubernetes

```bash
# Vérifier les événements récents
kubectl get events -n intelectgame --sort-by='.lastTimestamp' | tail -20
```

### 4. Vérifier que le frontend utilise bien apiClient

**Dans le code** :
- `AdminDashboard.vue` doit utiliser `gameService.startGame()` ou `apiClient.post()`
- `apiClient` ajoute automatiquement le token via l'intercepteur

**Dans la console du navigateur** :
```javascript
// Vérifier que apiClient est bien configuré
import { apiClient } from '@/services/api'
console.log('apiClient:', apiClient)
```

## Résumé

1. ✅ Vérifier que le frontend envoie le header (console navigateur)
2. ✅ Appliquer la configuration Nginx corrigée
3. ✅ Redémarrer Nginx
4. ✅ Vérifier que la configuration est bien appliquée
5. ✅ Tester depuis le navigateur et vérifier les logs

Le problème devrait être résolu après ces étapes.


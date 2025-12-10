# Debug : Header Authorization non transmis en production

## Problème

Le header `Authorization` n'est pas transmis par Nginx vers les services backend, causant des erreurs 401 Unauthorized.

## Diagnostic étape par étape

### 1. Vérifier que le frontend envoie le header

**Dans le navigateur (F12)** :
1. Ouvrez l'onglet **Network**
2. Faites une requête (ex: démarrer le jeu)
3. Cliquez sur la requête `POST /api/game/start`
4. Allez dans l'onglet **Headers** → **Request Headers**
5. Vérifiez que `Authorization: Bearer <token>` est présent

**Si le header n'est pas présent** :
- Vérifiez la console du navigateur pour les logs :
  ```
  🔑 Adding auth token to request: ...
  ```
- Vérifiez que le token est dans localStorage :
  ```javascript
  localStorage.getItem('adminToken')
  ```

### 2. Vérifier que Nginx reçoit le header

**Sur la VM** :
```bash
# Vérifier les logs Nginx (si les logs de debug sont activés)
kubectl logs -n intelectgame -l app=nginx-proxy --tail=100 | grep -i authorization
```

**Si les logs ne montrent pas le header** :
- Le problème vient du frontend ou du navigateur
- Vérifiez que le frontend utilise bien `apiClient` qui ajoute automatiquement le token

### 3. Vérifier que Nginx transmet le header

**Sur la VM** :
```bash
# Vérifier la configuration Nginx dans le pod
NGINX_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n intelectgame $NGINX_POD -- cat /etc/nginx/nginx.conf | grep -A 5 "location /api/game"
```

**Vérifiez que** :
- `underscores_in_headers on;` est présent dans le bloc `http`
- `proxy_set_header Authorization $http_authorization;` est présent dans `location /api/game`
- `proxy_pass_request_headers on;` est présent

### 4. Vérifier que le game-service reçoit le header

**Sur la VM** :
```bash
# Vérifier les logs du game-service
kubectl logs -f -l app=game-service -n intelectgame | grep -i "AUTHENTICATION"
```

**Vous devriez voir** :
```
🔐 Authorization header: PRESENT
```

**Si vous voyez `MISSING`** :
- Le header n'est pas transmis par Nginx
- Vérifiez que Nginx a bien redémarré avec la nouvelle configuration

## Solutions

### Solution 1 : Vérifier que Nginx a bien redémarré

```bash
# Appliquer la configuration
kubectl apply -f k8s/nginx-proxy-config.yaml

# Forcer le redémarrage de Nginx
kubectl rollout restart deployment/nginx-proxy -n intelectgame

# Attendre que Nginx soit prêt
kubectl rollout status deployment/nginx-proxy -n intelectgame --timeout=120s

# Vérifier que le pod est prêt
kubectl get pods -n intelectgame -l app=nginx-proxy
```

### Solution 2 : Vérifier la configuration dans le pod

```bash
NGINX_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')

# Vérifier underscores_in_headers
kubectl exec -n intelectgame $NGINX_POD -- cat /etc/nginx/nginx.conf | grep "underscores_in_headers"

# Vérifier proxy_set_header Authorization
kubectl exec -n intelectgame $NGINX_POD -- cat /etc/nginx/nginx.conf | grep -A 2 "proxy_set_header Authorization"

# Tester la configuration
kubectl exec -n intelectgame $NGINX_POD -- nginx -t
```

### Solution 3 : Supprimer et recréer le pod Nginx

Si la configuration n'est pas appliquée correctement :

```bash
# Supprimer le pod (il sera recréé automatiquement)
kubectl delete pod -n intelectgame -l app=nginx-proxy

# Attendre que le nouveau pod soit prêt
kubectl get pods -n intelectgame -l app=nginx-proxy -w
```

### Solution 4 : Vérifier que le frontend envoie bien le header

**Dans la console du navigateur** :
```javascript
// Vérifier que le token est présent
console.log('Token:', localStorage.getItem('adminToken'))

// Vérifier que apiClient ajoute le token
// Les logs devraient montrer :
// 🔑 Adding auth token to request: /api/game/start Token present: true Token length: ...
```

**Si le token n'est pas présent** :
1. Reconnectez-vous au dashboard admin
2. Vérifiez que le token est bien stocké après la connexion

### Solution 5 : Utiliser le script de diagnostic

```bash
# Exécuter le script de diagnostic complet
./k8s/scripts/diagnose-auth-header-issue.sh
```

## Configuration Nginx correcte

La configuration Nginx doit contenir :

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

## Points importants

1. **`underscores_in_headers on;`** : **OBLIGATOIRE** pour que Nginx reconnaisse `Authorization` comme `$http_authorization`

2. **`proxy_set_header Authorization $http_authorization;`** : Force la transmission du header si présent

3. **`proxy_pass_request_headers on;`** : Transmet tous les headers de la requête originale

4. **Ordre des directives** : L'ordre n'est pas critique, mais il est recommandé de mettre `proxy_set_header Authorization` avant `proxy_pass_request_headers`

5. **Headers vides** : Si `$http_authorization` est vide, Nginx ne transmettra pas le header `Authorization` (comportement normal)

## Si le problème persiste

1. **Vérifier les logs complets** :
   ```bash
   kubectl logs -f -l app=game-service -n intelectgame
   kubectl logs -f -l app=nginx-proxy -n intelectgame
   ```

2. **Vérifier les événements Kubernetes** :
   ```bash
   kubectl get events -n intelectgame --sort-by='.lastTimestamp' | tail -20
   ```

3. **Vérifier la ConfigMap** :
   ```bash
   kubectl get configmap nginx-proxy-config -n intelectgame -o yaml | grep -A 3 "proxy_set_header Authorization"
   ```

4. **Tester directement depuis le pod Nginx** (si curl est disponible) :
   ```bash
   NGINX_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')
   kubectl exec -n intelectgame $NGINX_POD -- sh -c 'echo "Authorization: Bearer test-token" | curl -v -H @- http://game-service.intelectgame.svc.cluster.local:3003/game/state'
   ```


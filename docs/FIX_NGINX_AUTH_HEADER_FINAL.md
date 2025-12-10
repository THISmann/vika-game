# Fix Final : Transmission du Header Authorization par Nginx

## Problème

Le header `Authorization` n'était pas transmis par Nginx vers les services backend, causant des erreurs 401 Unauthorized.

## Cause

1. **Variable non définie** : La configuration utilisait `$auth_header` qui n'était pas définie dans la map
2. **Map incorrecte** : La map définissait `$auth_header_preserved` mais on utilisait `$auth_header`

## Solution

Utiliser directement `$http_authorization` dans `proxy_set_header Authorization` car :
- `underscores_in_headers on;` est activé dans le bloc `http`
- Nginx convertit automatiquement le header `Authorization` en variable `$http_authorization`
- Pas besoin de map si `underscores_in_headers` est activé

## Configuration appliquée

### 1. Bloc `http`
```nginx
http {
    # Permettre les underscores dans les noms de headers
    underscores_in_headers on;
    
    # Map pour préserver le header Authorization (utilisé comme fallback)
    map $http_authorization $auth_header_preserved {
        default $http_authorization;
        '' '';
    }
}
```

### 2. Location `/api/auth`
```nginx
location /api/auth {
    # ...
    # CRITIQUE: Transmettre le header Authorization
    proxy_set_header Authorization $http_authorization;
    proxy_pass_request_headers on;
}
```

### 3. Location `/api/quiz`
```nginx
location /api/quiz {
    # ...
    # CRITIQUE: Transmettre le header Authorization
    proxy_set_header Authorization $http_authorization;
    proxy_pass_request_headers on;
}
```

### 4. Location `/api/game`
```nginx
location /api/game {
    # ...
    # CRITIQUE: Transmettre le header Authorization
    proxy_set_header Authorization $http_authorization;
    proxy_pass_request_headers on;
}
```

## Application de la correction

Sur votre VM, exécutez :

```bash
# Appliquer la configuration
kubectl apply -f k8s/nginx-proxy-config.yaml

# Redémarrer Nginx
kubectl rollout restart deployment/nginx-proxy -n intelectgame

# Attendre que Nginx soit prêt
kubectl rollout status deployment/nginx-proxy -n intelectgame --timeout=120s
```

Ou utilisez le script :

```bash
./k8s/scripts/apply-nginx-auth-fix-final.sh
```

## Vérification

### 1. Vérifier la configuration dans le pod
```bash
NGINX_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n intelectgame $NGINX_POD -- cat /etc/nginx/nginx.conf | grep -A 2 "proxy_set_header Authorization"
```

### 2. Vérifier les logs du game-service
```bash
kubectl logs -f -l app=game-service -n intelectgame | grep -i "AUTHENTICATION"
```

Vous devriez maintenant voir :
```
🔐 Authorization header: PRESENT
```

Au lieu de :
```
🔐 Authorization header: MISSING
```

### 3. Tester depuis le navigateur
1. Rechargez la page du dashboard admin
2. Essayez de démarrer le jeu
3. Vérifiez que l'erreur 401 ne se produit plus

## Notes importantes

1. **`underscores_in_headers on;`** : Cette directive est **CRITIQUE** pour que Nginx reconnaisse le header `Authorization` (qui devient `$http_authorization`)

2. **`proxy_pass_request_headers on;`** : Cette directive transmet tous les headers de la requête originale, y compris `Authorization`

3. **`proxy_set_header Authorization $http_authorization;`** : Cette directive force explicitement la transmission du header, même s'il est vide (mais il ne sera pas transmis si vide, ce qui est normal)

4. **Ordre des directives** : L'ordre n'est pas critique, mais il est recommandé de mettre `proxy_set_header Authorization` avant `proxy_pass_request_headers`

## Si le problème persiste

1. Vérifier que Nginx a bien redémarré :
   ```bash
   kubectl get pods -n intelectgame -l app=nginx-proxy
   ```

2. Vérifier que la configuration est bien chargée :
   ```bash
   NGINX_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')
   kubectl exec -n intelectgame $NGINX_POD -- nginx -t
   ```

3. Vérifier que le frontend envoie bien le header :
   - Ouvrez la console du navigateur (F12)
   - Allez dans l'onglet Network
   - Faites une requête (ex: démarrer le jeu)
   - Vérifiez que la requête a le header `Authorization: Bearer <token>`

4. Vérifier les logs Nginx (si activés) :
   ```bash
   kubectl logs -n intelectgame -l app=nginx-proxy | grep -i authorization
   ```


# 🔒 Résoudre le problème de transmission du header Authorization

## 🔍 Problème identifié

Les logs du game-service montrent :
```
🔐 Authorization header: MISSING
❌ No authorization header provided
```

Cela signifie que le header `Authorization` n'est **pas transmis** par Nginx au game-service.

## ✅ Solution appliquée

### 1. Configuration Nginx corrigée

Ajout de :
- `underscores_in_headers on;` - Permet d'utiliser `$http_authorization` (avec underscore)
- Map `$auth_header` - Préserve le header Authorization s'il existe
- `proxy_set_header Authorization $auth_header;` - Transmet le header via la map

### 2. Application de la correction

```bash
# Appliquer la correction
./k8s/scripts/apply-nginx-auth-fix-final.sh
```

Ou manuellement :

```bash
# 1. Appliquer la configuration
kubectl apply -f k8s/nginx-proxy-config.yaml

# 2. Redémarrer Nginx
kubectl rollout restart deployment/nginx-proxy -n intelectgame

# 3. Vérifier
kubectl rollout status deployment/nginx-proxy -n intelectgame
```

## 🔍 Vérification

### 1. Vérifier que le token est stocké

Dans la console du navigateur (F12) :
```javascript
localStorage.getItem('adminToken')
```

### 2. Vérifier que le header est envoyé

1. Onglet Network (F12 > Network)
2. Faire une action admin
3. Cliquer sur la requête `POST /api/game/start`
4. Vérifier dans "Request Headers" que `Authorization: Bearer <token>` est présent

### 3. Vérifier les logs du game-service

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

## 🐛 Si le problème persiste

### Vérifier la configuration Nginx dans le pod

```bash
NGINX_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n intelectgame $NGINX_POD -- cat /etc/nginx/nginx.conf | grep -A 5 "auth_header"
```

### Vérifier que la ConfigMap est mise à jour

```bash
kubectl get configmap nginx-proxy-config -n intelectgame -o yaml | grep -A 3 "auth_header"
```

### Vérifier les logs Nginx

```bash
kubectl logs -f -l app=nginx-proxy -n intelectgame
```

## 📝 Changements dans la configuration

### Avant
```nginx
proxy_set_header Authorization $http_authorization;
```

### Après
```nginx
# Dans le bloc http
underscores_in_headers on;
map $http_authorization $auth_header {
    default $http_authorization;
    '' '';
}

# Dans chaque location
proxy_set_header Authorization $auth_header;
```

## 💡 Pourquoi cette solution fonctionne

1. **`underscores_in_headers on;`** : Permet à Nginx de reconnaître les headers avec underscores comme `$http_authorization`

2. **Map `$auth_header`** : Préserve le header s'il existe, évite d'écraser avec une valeur vide

3. **`proxy_pass_request_headers on;`** : Transmet tous les headers de la requête originale en plus des headers définis explicitement

## 🆘 Support

Si le problème persiste après avoir appliqué la correction :
1. Vérifiez que le token est stocké dans le navigateur
2. Vérifiez que le header est envoyé (onglet Network)
3. Vérifiez les logs du game-service pour voir si le header est maintenant reçu
4. Vérifiez la configuration Nginx dans le pod pour confirmer que les changements sont appliqués


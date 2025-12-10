# 🔒 Résoudre l'erreur 401 Unauthorized dans Kubernetes

Guide pour résoudre les erreurs 401 Unauthorized lors du déploiement sur Kubernetes.

## 🔍 Diagnostic

L'erreur `401 (Unauthorized)` se produit lorsque :
- Le token d'authentification n'est pas envoyé par le frontend
- Le token n'est pas transmis par Nginx aux services backend
- Le token est invalide ou expiré
- Le middleware d'authentification rejette le token

## ✅ Solution

### 1. Vérifier que le token est stocké

Dans la console du navigateur (F12) :

```javascript
// Vérifier que le token existe
console.log('Token:', localStorage.getItem('adminToken'))

// Si le token n'existe pas, se reconnecter
// Aller sur /admin/login et se connecter avec admin/admin
```

### 2. Vérifier que Nginx transmet le header Authorization

La configuration Nginx doit inclure :

```nginx
# Dans chaque location /api/*
if ($http_authorization) {
    proxy_set_header Authorization $http_authorization;
}
proxy_pass_request_headers on;
```

### 3. Appliquer la correction

```bash
# Appliquer la configuration Nginx corrigée
./k8s/scripts/fix-nginx-auth.sh
```

Ou manuellement :

```bash
# 1. Appliquer la configuration
kubectl apply -f k8s/nginx-proxy-config.yaml

# 2. Redémarrer Nginx
kubectl rollout restart deployment/nginx-proxy -n intelectgame

# 3. Vérifier que le pod est prêt
kubectl rollout status deployment/nginx-proxy -n intelectgame
```

### 4. Vérifier les logs

```bash
# Logs Nginx
kubectl logs -f -l app=nginx-proxy -n intelectgame

# Logs du service backend (game-service, quiz-service)
kubectl logs -f -l app=game-service -n intelectgame | grep -i authorization
kubectl logs -f -l app=quiz-service -n intelectgame | grep -i authorization
```

## 🔧 Vérifications étape par étape

### Étape 1 : Vérifier le frontend

1. Ouvrir la console du navigateur (F12)
2. Aller dans l'onglet Network
3. Faire une requête admin (ex: supprimer une question)
4. Vérifier dans l'onglet Headers de la requête :
   - Le header `Authorization: Bearer <token>` est présent
   - Le token n'est pas vide

### Étape 2 : Vérifier Nginx

```bash
# Vérifier la configuration Nginx
kubectl get configmap nginx-proxy-config -n intelectgame -o yaml | grep -A 5 "Authorization"

# Vérifier les logs Nginx pour voir si le header est reçu
kubectl logs -f -l app=nginx-proxy -n intelectgame | grep -i authorization
```

### Étape 3 : Vérifier les services backend

```bash
# Vérifier que les services reçoivent le header
kubectl logs -f -l app=game-service -n intelectgame

# Chercher dans les logs les messages d'authentification
# Le middleware devrait logger si le token est présent ou non
```

### Étape 4 : Tester depuis un pod

```bash
# Tester une requête avec authentification depuis un pod
NGINX_POD=$(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}')

# Tester avec un token (remplacer <TOKEN> par un vrai token)
kubectl exec -n intelectgame $NGINX_POD -- curl -H "Authorization: Bearer <TOKEN>" http://game-service:3003/game/state
```

## 🐛 Problèmes courants

### Problème 1 : Token non stocké

**Symptôme** : `localStorage.getItem('adminToken')` retourne `null`

**Solution** :
1. Aller sur `/admin/login`
2. Se connecter avec `admin` / `admin`
3. Vérifier que le token est stocké : `localStorage.getItem('adminToken')`

### Problème 2 : Nginx ne transmet pas le header

**Symptôme** : Le header Authorization est présent dans la requête frontend mais absent dans les logs backend

**Solution** :
1. Vérifier la configuration Nginx :
   ```bash
   kubectl get configmap nginx-proxy-config -n intelectgame -o yaml
   ```
2. Appliquer la correction :
   ```bash
   ./k8s/scripts/fix-nginx-auth.sh
   ```

### Problème 3 : Token invalide ou expiré

**Symptôme** : Le token est présent mais rejeté par le middleware

**Solution** :
1. Se reconnecter pour obtenir un nouveau token
2. Vérifier que le token n'est pas expiré (tokens valides 24h)
3. Vérifier les logs du service backend pour voir l'erreur exacte

### Problème 4 : Middleware d'authentification ne fonctionne pas

**Symptôme** : Le token est transmis mais le middleware retourne toujours 401

**Solution** :
1. Vérifier les logs du service backend :
   ```bash
   kubectl logs -f -l app=game-service -n intelectgame | grep -i "auth\|401\|unauthorized"
   ```
2. Vérifier que `AUTH_SERVICE_URL` est correctement configuré :
   ```bash
   kubectl get configmap app-config -n intelectgame -o yaml | grep AUTH_SERVICE_URL
   ```
3. Vérifier que le quiz-service peut contacter l'auth-service :
   ```bash
   kubectl exec -n intelectgame <quiz-service-pod> -- curl http://auth-service:3001/health
   ```

## 📝 Checklist de résolution

- [ ] Token stocké dans `localStorage.getItem('adminToken')`
- [ ] Header `Authorization: Bearer <token>` présent dans les requêtes frontend
- [ ] Configuration Nginx inclut `proxy_set_header Authorization $http_authorization;`
- [ ] Pod Nginx redémarré après modification de la configuration
- [ ] Services backend reçoivent le header Authorization (vérifier les logs)
- [ ] `AUTH_SERVICE_URL` correctement configuré dans le ConfigMap
- [ ] Services peuvent contacter l'auth-service pour vérifier le token

## 🆘 Si le problème persiste

1. **Vérifier tous les logs** :
   ```bash
   # Logs Nginx
   kubectl logs -f -l app=nginx-proxy -n intelectgame
   
   # Logs API Gateway (si utilisé)
   kubectl logs -f -l app=api-gateway -n intelectgame
   
   # Logs services backend
   kubectl logs -f -l app=game-service -n intelectgame
   kubectl logs -f -l app=quiz-service -n intelectgame
   ```

2. **Vérifier la configuration complète** :
   ```bash
   ./k8s/scripts/check-all.sh
   ```

3. **Tester manuellement** :
   ```bash
   # Depuis un pod, tester avec curl
   kubectl exec -n intelectgame <pod-name> -- curl -v \
     -H "Authorization: Bearer <TOKEN>" \
     http://game-service:3003/game/state
   ```

## 📚 Ressources

- `k8s/nginx-proxy-config.yaml` - Configuration Nginx
- `k8s/scripts/fix-nginx-auth.sh` - Script de correction
- `node/api-gateway/src/routes/gateway.routes.js` - Configuration API Gateway
- `vue/front/src/services/api.js` - Service API frontend


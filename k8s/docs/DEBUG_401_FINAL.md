# 🐛 Guide final : Résoudre l'erreur 401 Unauthorized

Guide complet pour résoudre définitivement l'erreur 401 lors du démarrage du jeu.

## 🔍 Diagnostic étape par étape

### Étape 1 : Vérifier le token dans le navigateur

1. Ouvrez la console du navigateur (F12)
2. Exécutez :
   ```javascript
   const token = localStorage.getItem('adminToken')
   console.log('Token:', token)
   console.log('Token exists:', !!token)
   ```

3. Si le token n'existe pas :
   - Allez sur `http://82.202.141.248/admin/login`
   - Connectez-vous avec `admin` / `admin`
   - Vérifiez que le token est maintenant stocké

### Étape 2 : Vérifier que le header est envoyé

1. Ouvrez l'onglet Network (F12 > Network)
2. Faites une action admin (ex: démarrer le jeu)
3. Cliquez sur la requête `POST /api/game/start`
4. Allez dans l'onglet "Headers"
5. Vérifiez dans "Request Headers" :
   - `Authorization: Bearer <token>` doit être présent
   - Le token ne doit pas être vide

### Étape 3 : Vérifier les logs du game-service

```bash
# Voir les logs en temps réel
kubectl logs -f -l app=game-service -n intelectgame

# Chercher spécifiquement les logs d'authentification
kubectl logs -f -l app=game-service -n intelectgame | grep -i "AUTHENTICATION\|Authorization"
```

Vous devriez voir :
```
🔐 ========== AUTHENTICATION REQUEST ==========
🔐 Method: POST
🔐 Path: /game/start
🔐 Authorization header: PRESENT ou MISSING
```

### Étape 4 : Vérifier la configuration Nginx

```bash
# Vérifier que Nginx transmet le header
./k8s/scripts/check-auth-headers.sh
```

## ✅ Solutions selon le problème

### Problème 1 : Token non stocké

**Symptôme** : `localStorage.getItem('adminToken')` retourne `null`

**Solution** :
1. Se reconnecter sur `/admin/login`
2. Vérifier que le token est stocké après la connexion
3. Vérifier les logs du frontend pour voir si la connexion réussit

### Problème 2 : Header non envoyé par le frontend

**Symptôme** : Le header `Authorization` n'apparaît pas dans l'onglet Network

**Solution** :
1. Vérifier que `apiClient` est utilisé (pas `axios` directement)
2. Vérifier que l'intercepteur fonctionne :
   ```javascript
   // Dans la console du navigateur
   import { apiClient } from '@/services/api'
   console.log('apiClient:', apiClient)
   ```

### Problème 3 : Nginx ne transmet pas le header

**Symptôme** : Le header est présent dans la requête frontend mais absent dans les logs du game-service

**Solution** :
```bash
# Appliquer la configuration corrigée
kubectl apply -f k8s/nginx-proxy-config.yaml

# Redémarrer Nginx
kubectl rollout restart deployment/nginx-proxy -n intelectgame

# Vérifier
kubectl rollout status deployment/nginx-proxy -n intelectgame
```

### Problème 4 : Game-service ne reçoit pas le header

**Symptôme** : Les logs montrent "Authorization header: MISSING"

**Solution** :
1. Vérifier que Nginx transmet bien le header (voir Problème 3)
2. Vérifier les logs Nginx pour voir si le header est reçu :
   ```bash
   kubectl logs -f -l app=nginx-proxy -n intelectgame | grep -i "authorization"
   ```

### Problème 5 : Token invalide ou expiré

**Symptôme** : Le header est présent mais le middleware rejette le token

**Solution** :
1. Se reconnecter pour obtenir un nouveau token
2. Vérifier que le token n'est pas expiré (tokens valides 24h)
3. Vérifier les logs du game-service pour voir l'erreur exacte :
   ```bash
   kubectl logs -f -l app=game-service -n intelectgame | grep -i "auth\|401"
   ```

## 🔧 Scripts de diagnostic

### Diagnostic complet

```bash
./k8s/scripts/debug-401-error.sh
```

### Vérifier les headers

```bash
./k8s/scripts/check-auth-headers.sh
```

### Redémarrer Nginx

```bash
./k8s/scripts/fix-nginx-and-restart.sh
```

## 📋 Checklist de résolution

- [ ] Token stocké dans `localStorage.getItem('adminToken')`
- [ ] Header `Authorization: Bearer <token>` présent dans la requête frontend (Network tab)
- [ ] Configuration Nginx inclut `proxy_set_header Authorization $http_authorization;`
- [ ] Nginx redémarré après modification de la configuration
- [ ] Logs du game-service montrent "Authorization header: PRESENT"
- [ ] Token valide (pas expiré, format correct)

## 🆘 Si rien ne fonctionne

1. **Vérifier tous les logs** :
   ```bash
   # Logs Nginx
   kubectl logs -f -l app=nginx-proxy -n intelectgame
   
   # Logs game-service
   kubectl logs -f -l app=game-service -n intelectgame
   ```

2. **Tester directement depuis un pod** :
   ```bash
   # Obtenir un token
   # Puis tester directement
   kubectl exec -n intelectgame <game-service-pod> -- \
     node -e "const http = require('http'); const req = http.request({hostname: 'localhost', port: 3003, path: '/game/state', method: 'GET', headers: {'Authorization': 'Bearer YOUR_TOKEN'}}, (res) => {console.log('Status:', res.statusCode); res.on('data', d => console.log(d.toString()));}); req.end();"
   ```

3. **Vérifier la connectivité** :
   ```bash
   # Vérifier que game-service peut contacter auth-service
   kubectl exec -n intelectgame <game-service-pod> -- \
     ping -c 3 auth-service.intelectgame.svc.cluster.local
   ```

## 📚 Fichiers modifiés

- `node/game-service/middleware/auth.middleware.js` - Logs de diagnostic ajoutés
- `vue/front/src/services/api.js` - Logs toujours actifs pour le débogage
- `k8s/nginx-proxy-config.yaml` - Configuration corrigée pour transmettre Authorization

## 💡 Prochaines étapes

1. Exécutez `./k8s/scripts/debug-401-error.sh` pour voir où le problème se situe
2. Vérifiez les logs du game-service après avoir tenté de démarrer le jeu
3. Vérifiez que le token est bien stocké et envoyé depuis le navigateur


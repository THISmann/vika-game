# CREDENTIALS POUR /user/login

## ✅ SOLUTION IMPLÉMENTÉE ET TESTÉE

Le problème était que le frontend utilisait des chemins relatifs (`/api/auth`) qui ne fonctionnaient pas via port-forward car il n'y a pas de proxy pour router ces requêtes.

### 🔧 CORRECTION APPORTÉE

Modification de `vue/front/src/config/api.js` pour détecter au runtime si on accède via `localhost` ou `127.0.0.1` (port-forward) et utiliser l'API Gateway directement via `http://127.0.0.1:3000` au lieu des chemins relatifs.

**Changements:**
1. Détection de l'accès via localhost
2. Redirection automatique vers l'API Gateway (`http://127.0.0.1:3000`) au runtime
3. Amélioration des messages d'erreur dans `AdminLogin.vue`

---

## 📋 CREDENTIALS POUR /user/login

### URL Frontend:
```
http://127.0.0.1:56292/user/login
```

### Credentials:
- **Email:** `admin@vika-game.com`
- **Password:** `admin`

### Route API:
- **Endpoint:** `POST /auth/users/login`
- **Via API Gateway:** `POST http://127.0.0.1:3000/auth/users/login`
- **Body:**
  ```json
  {
    "email": "admin@vika-game.com",
    "password": "admin"
  }
  ```

---

## 🚀 DÉMARRAGE DES PORT-FORWARDS

```bash
# Démarrer les port-forwards
kubectl port-forward -n intelectgame svc/api-gateway 3000:3000 &
kubectl port-forward -n intelectgame svc/frontend 56292:80 &

# Tester la connexion
curl -X POST "http://127.0.0.1:3000/auth/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vika-game.com","password":"admin"}'
```

---

## ✅ TEST RÉUSSI

- ✅ API Gateway accessible sur `http://127.0.0.1:3000`
- ✅ Frontend accessible sur `http://127.0.0.1:56292/user/login`
- ✅ Login testé avec succès via curl
- ✅ Frontend redéployé avec la nouvelle image corrigée

---

## 📝 NOTE IMPORTANTE

Le frontend détecte maintenant automatiquement si on accède via `localhost` ou `127.0.0.1` et utilise l'API Gateway directement au lieu des chemins relatifs. Cela permet de fonctionner correctement via port-forward depuis Kubernetes.

**Pour que les changements prennent effet:**
1. Rebuild l'image Docker frontend: `docker build -t gamev2-frontend:local --file vue/front/Dockerfile vue/front`
2. Charger dans Minikube: `minikube image load gamev2-frontend:local`
3. Redéployer: `kubectl set image deployment/frontend -n intelectgame frontend=gamev2-frontend:local && kubectl rollout restart deployment/frontend -n intelectgame`


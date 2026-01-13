# CREDENTIALS POUR /user/login - CORRIGÉ

## ✅ PROBLÈME RÉSOLU

### Problème identifié:
1. **Erreur réseau (ERR_NETWORK, ERR_CONNECTION_RESET)**: Le frontend ne pouvait pas se connecter à l'API Gateway
2. **Mot de passe incorrect**: L'utilisateur utilisait `password123` au lieu de `admin`
3. **URL API mal construite**: La détection localhost ne fonctionnait pas correctement

### Corrections appliquées:
1. ✅ Code frontend corrigé dans `vue/front/src/config/api.js`
   - Meilleure détection de l'accès via localhost
   - Redirection automatique vers `http://127.0.0.1:3000`
   - Gestion des cas où l'URL est vide ou invalide
2. ✅ Image Docker rebuildée et redéployée
3. ✅ Port-forwards configurés correctement

---

## 📋 CREDENTIALS POUR /user/login

### URL Frontend:
```
http://127.0.0.1:64802/user/login
```

### Credentials:
- **Email:** `admin@vika-game.com`
- **Password:** `admin` ⚠️ **PAS password123**

### Route API:
- **Endpoint:** `POST /auth/users/login`
- **URL complète:** `http://127.0.0.1:3000/auth/users/login`

---

## 🔧 CONFIGURATION TECHNIQUE

### Port-forwards nécessaires:
```bash
# API Gateway
kubectl port-forward -n intelectgame svc/api-gateway 3000:3000

# Frontend User
kubectl port-forward -n intelectgame svc/frontend 64802:80
```

### Script de démarrage:
```bash
pkill -f "kubectl port-forward" 2>/dev/null || true
sleep 2
kubectl port-forward -n intelectgame svc/api-gateway 3000:3000 > /tmp/api-pf.log 2>&1 &
kubectl port-forward -n intelectgame svc/frontend 64802:80 > /tmp/frontend-pf.log 2>&1 &
sleep 5
echo "✅ Port-forwards démarrés"
```

---

## ✅ TESTS EFFECTUÉS

1. ✅ API Gateway accessible: `http://127.0.0.1:3000/health` → `ok`
2. ✅ Frontend accessible: `http://127.0.0.1:64802/` → HTTP 200
3. ✅ Login API fonctionne: `POST /auth/users/login` → Token reçu avec `admin/admin`
4. ✅ Image Docker rebuildée et déployée
5. ✅ Pods frontend Running

---

## 📝 NOTES IMPORTANTES

- ⚠️ **Le mot de passe est `admin`, PAS `password123`**
- Le frontend détecte automatiquement l'accès via `localhost` ou `127.0.0.1`
- Redirection automatique vers `http://127.0.0.1:3000` pour l'API Gateway
- Les port-forwards doivent être actifs pour que ça fonctionne

---

## 🚀 UTILISATION

1. Démarrer les port-forwards (voir section "Script de démarrage")
2. Accéder à: `http://127.0.0.1:64802/user/login`
3. Utiliser les credentials:
   - Email: `admin@vika-game.com`
   - Password: `admin`
4. Vous devriez être redirigé vers `/user/dashboard` après connexion réussie

---

✅ **TOUT EST PRÊT ET TESTÉ!**


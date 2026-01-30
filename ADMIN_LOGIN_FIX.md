# 🔧 Correction des erreurs de connexion Admin

## 🔍 Problème identifié

Lors de la connexion sur `http://localhost:5174/vika-admin/login`, la requête POST vers `/api/auth/admin/login` retournait une erreur **500**.

### Analyse des erreurs

1. **Erreur console :**
   - Message : `🔑 Attempting login to: /api/auth/admin/login`
   - Requête POST : `http://localhost:5174/api/auth/admin/login`
   - Statut : **500 Internal Server Error**

2. **Cause racine :**
   - Le proxy Vite dans `vite.config.js` réécrivait incorrectement le chemin
   - `/api/auth/admin/login` était transformé en `/admin/login` au lieu de `/auth/admin/login`
   - Le service d'authentification attend `/auth/admin/login`

## ✅ Solution appliquée

### Modification de `vue/admin/vite.config.js`

**Avant :**
```javascript
proxy: {
  '/api/auth': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/auth/, ''),  // ❌ Enlève tout
  },
}
```

**Après :**
```javascript
proxy: {
  '/api/auth': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/auth/, '/auth'),  // ✅ Préserve /auth
  },
}
```

### Corrections similaires pour les autres services

- `/api/quiz` → `/quiz` (au lieu de rien)
- `/api/game` → `/game` (au lieu de rien)

## 🚀 Actions requises

1. **Redémarrer le serveur Vite admin :**
   ```bash
   cd vue/admin
   npm run dev
   ```

2. **Tester la connexion :**
   - Aller sur `http://localhost:5174/vika-admin/login`
   - Utiliser les credentials : `admin` / `admin`
   - La connexion devrait maintenant fonctionner

## 📋 Vérification

Pour vérifier que le proxy fonctionne correctement :

```bash
# Test direct via le proxy
curl -X POST http://localhost:5174/api/auth/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}'
```

Cette requête devrait maintenant retourner un token au lieu d'une erreur 500.

## 🔍 Détails techniques

### Flux de la requête

1. Frontend envoie : `POST /api/auth/admin/login`
2. Proxy Vite intercepte : `/api/auth/*`
3. Proxy réécrit : `/api/auth/admin/login` → `/auth/admin/login`
4. Proxy redirige vers : `http://localhost:3001/auth/admin/login`
5. Service auth traite la requête et retourne le token

### Configuration du proxy

Le proxy Vite fonctionne uniquement en mode développement (`npm run dev`). En production, les requêtes doivent passer par un reverse proxy (nginx, traefik, etc.) configuré de la même manière.

## ⚠️ Notes importantes

- Les changements dans `vite.config.js` nécessitent un redémarrage du serveur Vite
- Le proxy ne fonctionne qu'en mode développement
- En production, utiliser un reverse proxy avec la même logique de réécriture

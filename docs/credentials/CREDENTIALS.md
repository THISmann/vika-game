# 🔐 Credentials - Local Environment

## ✅ Configuration mise à jour

Les variables d'environnement des frontends ont été mises à jour pour utiliser les URLs directes des services en développement local :
- `VITE_AUTH_SERVICE_URL=http://localhost:3001`
- `VITE_QUIZ_SERVICE_URL=http://localhost:3002`
- `VITE_GAME_SERVICE_URL=http://localhost:3003`

---

## 📋 Admin Login (Admin Dashboard)

**URL:** `http://localhost:5174/vika-admin/admin/login`

**Credentials:**
- **Username:** `admin`
- **Password:** `admin`

---

## 📋 User Login (User Dashboard)

**URL:** `http://localhost:5173/vika-game/user/login`

**Credentials:**
- **Email:** `admin@vika-game.com` (⚠️ **EMAIL complet requis**)
- **Password:** `admin`

⚠️ **IMPORTANT:** Vous devez entrer l'**EMAIL complet** (`admin@vika-game.com`), pas juste `admin`.

---

## 🔍 Test des APIs Backend

### Admin Login API
```bash
curl -X POST http://localhost:3001/auth/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}'
```

### User Login API
```bash
curl -X POST http://localhost:3001/auth/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@vika-game.com","password":"admin"}'
```

---

## ✅ Vérification

Les deux endpoints fonctionnent correctement. Si la connexion échoue dans le frontend, vérifiez :

1. ✅ Les services backend sont démarrés (`docker ps`)
2. ✅ L'admin existe dans la base de données
3. ✅ Vous utilisez les bons credentials (email complet pour User Login)

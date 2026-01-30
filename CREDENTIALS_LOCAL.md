# 🔐 Credentials pour l'environnement local

## 🚀 Création automatique des credentials

Pour créer automatiquement les credentials locaux, exécutez le script :

```bash
./scripts/create-local-credentials.sh
```

Ce script va :
1. Vérifier que le service d'authentification est accessible
2. Créer le compte admin (s'il n'existe pas)
3. Créer le compte client
4. Approuver le compte client
5. Tester les deux logins

---

## ✅ Frontend Client (User Login)

**URL:** `http://localhost:5173/auth/login`

**Credentials:**
- **Email:** `client@vika-game.com`
- **Password:** `client123`

**Note:** Ce compte utilisateur peut être créé automatiquement via le script `create-local-credentials.sh` ou sera créé au démarrage du service d'authentification (si la fonction d'initialisation est activée).

---

## ✅ Frontend Admin

**URL:** `http://localhost:5174/vika-admin/login`

**Credentials:**
- **Username:** `admin`
- **Password:** `admin`

**Note:** Ce compte admin est créé automatiquement lors du premier login avec ces credentials.

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
  -d '{"email":"client@vika-game.com","password":"client123"}'
```

---

## 📋 Détails des comptes

### Compte Client (par défaut)
- **Email:** `client@vika-game.com`
- **Password:** `client123`
- **Name:** `Client`
- **Role:** `user`
- **Status:** `approved`
- **Création:** Via script `create-local-credentials.sh` ou automatique au démarrage du service

### Compte Admin (par défaut)
- **ID:** `00000000-0000-0000-0000-000000000001`
- **Email:** `admin@vika-game.com`
- **Username:** `admin`
- **Password:** `admin`
- **Name:** `Admin`
- **Role:** `admin`
- **Status:** `approved`
- **Création:** Automatique lors du premier login admin/admin

---

## ✅ Tests effectués

Les credentials ont été testés et vérifiés le 29/01/2026 :

- ✅ **Admin Login:** Fonctionne correctement
- ✅ **Client Login:** Fonctionne correctement
- ✅ **Création automatique:** Script fonctionnel

### Résultats des tests API

**Admin Login:**
```json
{
  "token": "MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxLWFkbWluLTE3Njk2OTY2MDUyNjU="
}
```

**Client Login:**
```json
{
  "token": "dTE3Njk2OTY2MjUyNDgtdXNlci0xNzY5Njk2NjMyODE3",
  "user": {
    "id": "u1769696625248",
    "name": "Client",
    "email": "client@vika-game.com",
    "role": "user",
    "status": "approved"
  }
}
```

---

## ⚠️ SÉCURITÉ

**IMPORTANT:** Changez ces mots de passe par défaut en production!

Les identifiants par défaut sont uniquement pour le développement et les tests locaux.

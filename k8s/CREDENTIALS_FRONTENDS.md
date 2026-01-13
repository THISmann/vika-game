# IDENTIFIANTS POUR LES FRONTENDS

## ✅ FRONTEND ADMIN

**URL:** `http://127.0.0.1:57958/admin/login`

**Identifiants:**
- **Username:** `admin`
- **Password:** `admin`

**Note:** Ce compte admin existe par défaut et est créé automatiquement lors du premier login.

---

## ✅ FRONTEND USER (Joueur)

**URL:** `http://127.0.0.1:64802/user/login`

**Identifiants:**
- **Email:** `user@vika-game.com`
- **Password:** `user123`

**Note:** 
- Ce compte utilisateur est créé et approuvé automatiquement par le script `k8s/scripts/create-frontend-credentials.sh`
- Pour créer de nouveaux comptes, utilisez le script ou créez-les via le frontend user

---

## 🔐 CRÉATION DE NOUVEAUX COMPTES

### Pour créer un nouveau compte admin:
Le compte admin par défaut (`admin/admin`) est créé automatiquement. Pour créer d'autres comptes admin, vous devez modifier le code dans `node/auth-service/controllers/auth.controller.js`.

### Pour créer un nouveau compte utilisateur:
1. Accédez au frontend user: `http://127.0.0.1:64802/user/login`
2. Cliquez sur "Créer un compte" ou "Sign up"
3. Remplissez le formulaire avec:
   - Nom
   - Email
   - Password
4. Le compte sera créé avec le statut `pending`
5. Un admin doit approuver le compte dans le frontend admin

---

## 📋 AUTRES COMPTES EXISTANTS

### Compte admin par défaut:
- **Email:** `admin@vika-game.com`
- **Username:** `admin`
- **Password:** `admin`
- **Status:** `approved`
- **Role:** `admin`

---

## ⚠️ SÉCURITÉ

**IMPORTANT:** Changez ces mots de passe par défaut en production!

Les identifiants par défaut sont uniquement pour le développement et les tests.


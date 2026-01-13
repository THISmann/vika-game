# Credentials pour les Frontends déployés sur Kubernetes Minikube

## ✅ Frontend Admin

**URL d'accès :**
```
http://192.168.49.2:30081
```

**Identifiants :**
- **Username :** `admin`
- **Password :** `admin`

**Route API :**
- `/api/auth/admin/login` (via API Gateway)

**Note :** Ces credentials sont créés automatiquement lors de la première connexion si aucun admin n'existe dans la base de données MongoDB.

---

## ✅ Frontend User (Joueur)

**URL d'accès :**
```
http://192.168.49.2:30080
```

**Identifiants :**
- **Aucun identifiant requis**

**Processus d'inscription :**
1. Aller sur `http://192.168.49.2:30080/`
2. Cliquer sur "Jouer" ou aller sur `/player/register`
3. Entrer le **code de jeu** (4-6 caractères, ex: `ABC123`) fourni par l'administrateur
4. Entrer un **nom unique** (2-20 caractères, ex: `Alice`, `Bob`) choisi par le joueur
5. Rejoindre la partie

**Important :**
- Pas de mot de passe requis pour les joueurs
- Le nom doit être unique dans la partie active
- L'inscription n'est possible que si la partie n'a pas encore commencé

---

## 📋 Récapitulatif

| Frontend | URL | Username | Password | Inscription |
|----------|-----|----------|----------|-------------|
| **Admin** | `http://192.168.49.2:30081` | `admin` | `admin` | Non nécessaire |
| **User (Joueur)** | `http://192.168.49.2:30080` | Code de jeu + Nom | Aucun | Oui, via `/player/register` |

---

## 🔧 Commandes pour tester

**Test Admin Login (API) :**
```bash
kubectl port-forward -n intelectgame svc/api-gateway 3000:3000 &
curl -X POST "http://localhost:3000/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

**Vérifier les services :**
```bash
kubectl get services -n intelectgame | grep frontend
```

**Accéder aux frontends :**
```bash
# Frontend Admin
minikube service admin-frontend -n intelectgame

# Frontend User
minikube service frontend -n intelectgame
```

---

## ✅ Vérification du fonctionnement

Les credentials ont été testés et vérifiés :
- ✅ Login admin via API : **FONCTIONNEL**
- ✅ Route `/auth/admin/login` : **ACCESSIBLE**
- ✅ Token généré : **VALIDÉ**

---

**Date de vérification :** 2026-01-08
**Environnement :** Kubernetes Minikube
**Namespace :** `intelectgame`


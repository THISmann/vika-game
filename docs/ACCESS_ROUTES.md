# Routes d'accès aux différents services

## 🌐 Frontend Utilisateur (User Frontend)

**URL principale**: `http://vika-game.ru/`

### Routes principales :
- **Page d'accueil**: `http://vika-game.ru/`
- **Connexion utilisateur**: `http://vika-game.ru/auth/login`
- **Inscription utilisateur**: `http://vika-game.ru/auth/signup`
- **Dashboard utilisateur**: `http://vika-game.ru/user/dashboard`
- **Gestion des parties**: `http://vika-game.ru/user/parties`
- **Paramètres utilisateur**: `http://vika-game.ru/user/settings`

### Identifiants par défaut :
- **Email**: `admin@vika-game.com`
- **Password**: `admin`

---

## 🔐 Frontend Admin (Admin Frontend)

**URL principale**: `http://vika-game.ru/vika-admin/`

### Routes principales :
- **Connexion admin**: `http://vika-game.ru/vika-admin/login`
- **Dashboard admin**: `http://vika-game.ru/vika-admin/dashboard`
- **Gestion des questions**: `http://vika-game.ru/vika-admin/questions`
- **Gestion des utilisateurs**: `http://vika-game.ru/vika-admin/users`
- **Classement**: `http://vika-game.ru/vika-admin/leaderboard`

### Identifiants par défaut :
- **Username**: `admin`
- **Password**: `admin`

### ⚠️ Note importante :
- Le frontend admin est accessible uniquement via le domaine `vika-game.ru`
- Les tests depuis `localhost` ne fonctionneront pas car la règle Traefik nécessite le Host header correct

---

## 🚦 Traefik Dashboard

**URL**: `http://vika-game.ru/dashboard/`

### Accès :
- **Dashboard principal**: `http://vika-game.ru/dashboard/`
- **API Traefik**: `http://vika-game.ru/api/http/routers`
- **Vue d'ensemble**: `http://vika-game.ru/api/overview`
- **Version**: `http://vika-game.ru/api/version`

### Note :
- Le dashboard Traefik est accessible sans authentification (mode insecure activé pour le développement)
- En production, il est recommandé de sécuriser l'accès au dashboard

---

## 📊 Grafana Dashboards

**URL de base**: `http://vika-game.ru/grafana/login` (page de connexion Grafana)

### Routes principales :
- **Page de connexion**: `http://vika-game.ru/grafana/login`
- **Dashboard API Gateway**: `http://vika-game.ru/api-gateway-monitoring`
- **Dashboard Containers**: `http://vika-game.ru/container-monitoring`
- **Dashboard principal**: `http://vika-game.ru/d/api-gateway-dashboard/api-gateway-monitoring`

### Note importante :
- La route `/login` est utilisée par le frontend utilisateur
- Pour accéder à Grafana, utilisez `/grafana/login` au lieu de `/login`

### Identifiants par défaut :
- **Username**: `admin`
- **Password**: `admin`

### Dashboards disponibles :
1. **API Gateway Monitoring** (`/api-gateway-monitoring`)
   - Métriques de l'API Gateway
   - Taux de requêtes
   - Temps de réponse
   - Erreurs HTTP

2. **Container Monitoring** (`/container-monitoring`)
   - Métriques des conteneurs Docker
   - Utilisation CPU/Mémoire
   - Statistiques réseau

---

## 🔧 API Endpoints

**Base URL**: `http://vika-game.ru/api`

### Endpoints principaux :
- **Health Check**: `http://vika-game.ru/api/auth/health`
- **Login utilisateur**: `POST http://vika-game.ru/api/auth/users/login`
- **Login admin**: `POST http://vika-game.ru/api/auth/admin/login`
- **Liste des quiz**: `GET http://vika-game.ru/api/quiz/all`
- **État du jeu**: `GET http://vika-game.ru/api/game/state`
- **Code du jeu**: `GET http://vika-game.ru/api/game/code`

---

## 📝 Notes importantes

1. **HTTP vs HTTPS** :
   - Actuellement, tous les services sont accessibles en HTTP
   - HTTPS est configuré mais désactivé temporairement
   - Pour activer HTTPS, décommenter les routes `websecure` dans `docker-compose.yml`

2. **Accès direct aux services** (depuis le serveur uniquement) :
   - **API Gateway**: `http://localhost:3000`
   - **Auth Service**: `http://localhost:3001`
   - **Quiz Service**: `http://localhost:3002`
   - **Game Service**: `http://localhost:3003`
   - **Grafana**: `http://localhost:3005`
   - **Prometheus**: `http://localhost:9090`
   - **MinIO Console**: `http://localhost:9001`

3. **Réseau Docker** :
   - Tous les services communiquent via le réseau Docker `app-network`
   - Les services ne sont pas accessibles directement depuis l'extérieur (sauf via Traefik)

---

## 🔒 Sécurité

⚠️ **Important** : En production, il est fortement recommandé de :
- Activer HTTPS avec Let's Encrypt
- Sécuriser l'accès au dashboard Traefik
- Changer les mots de passe par défaut
- Configurer l'authentification pour Grafana
- Limiter l'accès aux dashboards de monitoring

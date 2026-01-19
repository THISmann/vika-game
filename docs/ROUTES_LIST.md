# 📍 Liste Complète des Routes - IntelectGame Platform

## 🌐 Routes Publiques (Production)

### Frontend Utilisateur
| Route | Service | Description | Accès |
|-------|---------|-------------|-------|
| `http://82.202.141.248/vika-game` | frontend | Page d'accueil | Public |
| `http://82.202.141.248/vika-game/*` | frontend | Toutes les routes Vue.js (SPA) | Public |
| `http://82.202.141.248/vika-game/auth/login` | frontend | Page de connexion utilisateur | Public |
| `http://82.202.141.248/vika-game/auth/signup` | frontend | Page d'inscription | Public |
| `http://82.202.141.248/vika-game/player/register` | frontend | Inscription joueur pour une partie | Public |
| `http://82.202.141.248/vika-game/user/dashboard` | frontend | Dashboard utilisateur | Authentifié |

### Frontend Administrateur
| Route | Service | Description | Accès |
|-------|---------|-------------|-------|
| `http://82.202.141.248/vika-admin` | admin-frontend | Page d'accueil admin | Public |
| `http://82.202.141.248/vika-admin/*` | admin-frontend | Toutes les routes Vue.js (SPA) | Public |
| `http://82.202.141.248/vika-admin/admin/login` | admin-frontend | Page de connexion admin | Public |
| `http://82.202.141.248/vika-admin/admin/dashboard` | admin-frontend | Dashboard administrateur | Admin |

### API Gateway
| Route | Service | Description | Accès |
|-------|---------|-------------|-------|
| `http://82.202.141.248/vika-game/api/*` | api-gateway | Point d'entrée unique pour toutes les APIs | Authentifié (selon endpoint) |

#### Endpoints API détaillés :

**Auth Service** (`/vika-game/api/auth/*`)
- `POST /vika-game/api/auth/register` - Inscription utilisateur
- `POST /vika-game/api/auth/login` - Connexion utilisateur
- `POST /vika-game/api/auth/admin/login` - Connexion administrateur
- `GET /vika-game/api/auth/me` - Informations utilisateur actuel
- `GET /vika-game/api/auth/users` - Liste des utilisateurs (admin)
- `GET /vika-game/api/auth/users/:id` - Détails d'un utilisateur

**Quiz Service** (`/vika-game/api/quiz/*`)
- `GET /vika-game/api/quiz` - Liste des quiz
- `POST /vika-game/api/quiz` - Créer un quiz (admin)
- `GET /vika-game/api/quiz/:id` - Détails d'un quiz
- `PUT /vika-game/api/quiz/:id` - Modifier un quiz (admin)
- `DELETE /vika-game/api/quiz/:id` - Supprimer un quiz (admin)
- `GET /vika-game/api/quiz/:id/questions` - Questions d'un quiz
- `POST /vika-game/api/quiz/:id/questions` - Ajouter une question (admin)

**Game Service** (`/vika-game/api/game/*`)
- `POST /vika-game/api/game/create` - Créer une partie (admin)
- `GET /vika-game/api/game/:code` - Détails d'une partie
- `GET /vika-game/api/game/:code/verify` - Vérifier un code de partie
- `GET /vika-game/api/game/:code/players` - Liste des joueurs connectés
- `POST /vika-game/api/game/:code/start` - Démarrer une partie (admin)
- `POST /vika-game/api/game/:code/next` - Question suivante (admin)
- `POST /vika-game/api/game/:code/answer` - Soumettre une réponse
- `GET /vika-game/api/game/:code/scores` - Classement

### WebSocket (Socket.IO)
| Route | Service | Description | Accès |
|-------|---------|-------------|-------|
| `http://82.202.141.248/socket.io/*` | game-service | Connexion WebSocket pour temps réel | Public (authentification via token) |

---

## 📊 Routes Monitoring

### Traefik Dashboard
| Route | Service | Description | Accès |
|-------|---------|-------------|-------|
| `http://82.202.141.248:8080/dashboard/` | traefik | Dashboard Traefik (API) | Public (local uniquement) |
| `http://82.202.141.248/dashboard` | traefik | Dashboard Traefik (via Traefik) | Public |

### Grafana Dashboards
| Route | Service | Description | Accès |
|-------|---------|-------------|-------|
| `http://82.202.141.248:3005` | grafana | Interface Grafana (port direct) | Admin (admin/admin) |
| `http://82.202.141.248/d/api-gateway-dashboard/api-gateway-monitoring` | grafana | Dashboard API Gateway (accès direct) | Admin (admin/admin) |
| `http://82.202.141.248/d/containers-dashboard/containers-monitoring` | grafana | Dashboard Containers (accès direct) | Admin (admin/admin) |
| `http://82.202.141.248/api-gateway-monitoring` | grafana | Dashboard API Gateway (route simplifiée) | Admin (admin/admin) |
| `http://82.202.141.248/container-monitoring` | grafana | Dashboard Containers (route simplifiée) | Admin (admin/admin) |
| `http://82.202.141.248/login` | grafana | Page de connexion Grafana | Public |
| `http://82.202.141.248/api/*` | grafana | API Grafana (via Traefik) | Admin |
| `http://82.202.141.248/public/*` | grafana | Assets publics Grafana | Public |
| `http://82.202.141.248/d/*` | grafana | Tous les dashboards Grafana | Admin |
| `http://82.202.141.248/user/*` | grafana | Routes utilisateur Grafana | Admin |

### Prometheus
| Route | Service | Description | Accès |
|-------|---------|-------------|-------|
| `http://82.202.141.248:9090` | prometheus | Interface Prometheus (port direct) | Public |
| `http://82.202.141.248:9090/graph` | prometheus | Graphique Prometheus | Public |
| `http://82.202.141.248:9090/api/v1/query` | prometheus | API Prometheus | Public |

### cAdvisor
| Route | Service | Description | Accès |
|-------|---------|-------------|-------|
| `http://82.202.141.248:8081/metrics` | cadvisor | Métriques Docker (format Prometheus) | Public |
| `http://82.202.141.248:8081/containers/` | cadvisor | Interface web cAdvisor | Public |

### Node Exporter
| Route | Service | Description | Accès |
|-------|---------|-------------|-------|
| `http://82.202.141.248:9100/metrics` | node-exporter | Métriques système (format Prometheus) | Public |

---

## 🔧 Routes Directes (Ports Exposés)

### Services Backend (Accès Direct)
| Service | Port | Route | Description |
|---------|------|-------|-------------|
| **api-gateway** | 3000 | `http://82.202.141.248:3000` | API Gateway (non exposé publiquement) |
| **auth-service** | 3001 | `http://82.202.141.248:3001` | Service d'authentification (non exposé publiquement) |
| **quiz-service** | 3002 | `http://82.202.141.248:3002` | Service de quiz (non exposé publiquement) |
| **game-service** | 3003 | `http://82.202.141.248:3003` | Service de jeu (non exposé publiquement) |
| **telegram-bot** | 3004 | `http://82.202.141.248:3004` | Bot Telegram (non exposé publiquement) |

### Services Frontend (Accès Direct - Développement)
| Service | Port | Route | Description |
|---------|------|-------|-------------|
| **frontend** | 5173 | `http://82.202.141.248:5173` | Frontend utilisateur (dev uniquement) |
| **admin-frontend** | 5174 | `http://82.202.141.248:5174` | Frontend admin (dev uniquement) |

### Services Infrastructure (Accès Direct)
| Service | Port | Route | Description |
|---------|------|-------|-------------|
| **traefik** | 80 | `http://82.202.141.248` | Reverse proxy (HTTP) |
| **traefik** | 8080 | `http://82.202.141.248:8080` | Dashboard Traefik |
| **mongodb** | 27017 | `mongodb://82.202.141.248:27017` | Base de données MongoDB |
| **redis** | 6379 | `redis://82.202.141.248:6379` | Cache Redis |
| **minio** | 9000 | `http://82.202.141.248:9000` | API MinIO |
| **minio** | 9001 | `http://82.202.141.248:9001` | Console MinIO |
| **prometheus** | 9090 | `http://82.202.141.248:9090` | Prometheus |
| **grafana** | 3005 | `http://82.202.141.248:3005` | Grafana (port direct) |
| **cadvisor** | 8081 | `http://82.202.141.248:8081` | cAdvisor |
| **node-exporter** | 9100 | `http://82.202.141.248:9100` | Node Exporter |

---

## 🎯 Routes par Priorité Traefik

Les routes Traefik sont évaluées par ordre de priorité (plus élevé = évalué en premier) :

| Priorité | Route | Service | Description |
|----------|-------|---------|-------------|
| **45** | `/user/*` | grafana | Routes utilisateur Grafana |
| **40** | `/login`, `/api/`, `/public/`, `/d/`, `/img/`, `/favicon.ico` | grafana | Routes principales Grafana |
| **35** | `/api-gateway-monitoring` | grafana | Dashboard API Gateway |
| **35** | `/container-monitoring` | grafana | Dashboard Containers |
| **30** | `/dashboard` | traefik | Dashboard Traefik |
| **10** | `/vika-admin` | admin-frontend | Frontend administrateur |
| **10** | `/vika-game` | frontend | Frontend utilisateur |
| **10** | `/vika-game/api` | api-gateway | API Gateway |
| **10** | `/socket.io` | game-service | WebSocket Socket.IO |

---

## 🔐 Routes Authentifiées

### Routes nécessitant une authentification utilisateur
- `/vika-game/user/dashboard`
- `/vika-game/api/auth/me`
- `/vika-game/api/game/:code/players`
- `/vika-game/api/game/:code/answer`
- `/vika-game/api/game/:code/scores`

### Routes nécessitant une authentification admin
- `/vika-admin/admin/dashboard`
- `/vika-game/api/quiz` (POST, PUT, DELETE)
- `/vika-game/api/quiz/:id/questions` (POST)
- `/vika-game/api/game/create`
- `/vika-game/api/game/:code/start`
- `/vika-game/api/game/:code/next`
- `/vika-game/api/auth/users`

### Routes publiques (sans authentification)
- `/vika-game` (page d'accueil)
- `/vika-game/auth/login`
- `/vika-game/auth/signup`
- `/vika-game/player/register`
- `/vika-admin/admin/login`
- `/vika-game/api/game/:code/verify`
- `/socket.io` (authentification optionnelle via token)

---

## 📝 Exemples d'URLs Complètes

### Frontend
```
http://82.202.141.248/vika-game
http://82.202.141.248/vika-game/auth/login
http://82.202.141.248/vika-game/player/register?code=ABC123
http://82.202.141.248/vika-admin/admin/login
```

### API
```
http://82.202.141.248/vika-game/api/auth/login
http://82.202.141.248/vika-game/api/quiz
http://82.202.141.248/vika-game/api/game/ABC123/verify
http://82.202.141.248/vika-game/api/game/ABC123/players
```

### Monitoring
```
http://82.202.141.248/dashboard
http://82.202.141.248/api-gateway-monitoring
http://82.202.141.248/container-monitoring
http://82.202.141.248:9090
http://82.202.141.248:3005
```

### WebSocket
```
ws://82.202.141.248/socket.io/?EIO=4&transport=websocket
```

---

## 🚀 Accès Rapide

### Pour les utilisateurs
- **Page d'accueil** : http://82.202.141.248/vika-game
- **Connexion** : http://82.202.141.248/vika-game/auth/login
- **Inscription** : http://82.202.141.248/vika-game/auth/signup

### Pour les administrateurs
- **Dashboard Admin** : http://82.202.141.248/vika-admin
- **Connexion Admin** : http://82.202.141.248/vika-admin/admin/login

### Pour les développeurs
- **Traefik Dashboard** : http://82.202.141.248:8080/dashboard/
- **Grafana** : http://82.202.141.248:3005
- **Prometheus** : http://82.202.141.248:9090
- **API Gateway Monitoring** : http://82.202.141.248/api-gateway-monitoring
- **Containers Monitoring** : http://82.202.141.248/container-monitoring

---

## ⚠️ Notes Importantes

1. **Routes via Traefik** : Toutes les routes publiques passent par Traefik sur le port 80
2. **Routes directes** : Les ports directs (3000-3005, 8080, 8081, 9090, 9100) sont accessibles mais peuvent être bloqués par le firewall
3. **Authentification** : La plupart des routes API nécessitent un token JWT dans le header `Authorization: Bearer <token>`
4. **WebSocket** : La connexion WebSocket se fait automatiquement via Socket.IO, pas besoin de route spécifique
5. **SPA Routing** : Les routes Vue.js (frontend et admin-frontend) sont gérées côté client, toutes les routes non-API redirigent vers l'application Vue.js

---

**Dernière mise à jour** : Janvier 2026
**Serveur** : 82.202.141.248


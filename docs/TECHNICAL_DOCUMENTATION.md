# Documentation Technique - IntelectGame Platform

## 📋 Table des matières

1. [Architecture Générale](#architecture-générale)
2. [Services et Containers](#services-et-containers)
3. [APIs et Endpoints](#apis-et-endpoints)
4. [WebSockets / Socket.IO](#websockets--socketio)
5. [Routes Traefik](#routes-traefik)
6. [Monitoring](#monitoring)
7. [Credentials par défaut](#credentials-par-défaut)
8. [Démarrage et Test](#démarrage-et-test)

---

## Architecture Générale

### Vue d'ensemble

IntelectGame est une plateforme de quiz interactifs en temps réel construite avec une architecture microservices. L'application utilise Docker Compose pour orchestrer les services et Traefik comme reverse proxy/API Gateway.

```
┌─────────────────────────────────────────────────────────────┐
│                    Traefik (Reverse Proxy)                   │
│                    Port 80 (HTTP)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │ Frontend│    │ Admin   │   │  APIs   │
   │  (Vue)  │    │ Frontend│   │ Gateway │
   └─────────┘    └─────────┘   └────┬────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────┐
        │                             │                         │
   ┌────▼────┐                  ┌────▼────┐              ┌────▼────┐
   │  Auth   │                  │  Quiz   │              │  Game   │
   │ Service │                  │ Service │              │ Service │
   │  :3001  │                  │  :3002  │              │  :3003  │
   └────┬────┘                  └────┬────┘              └────┬────┘
        │                             │                         │
        └─────────────────────────────┼─────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              ┌─────▼─────┐     ┌─────▼─────┐    ┌─────▼─────┐
              │  MongoDB  │     │   Redis   │    │   MinIO   │
              │  :27017   │     │   :6379   │    │   :9000   │
              └───────────┘     └───────────┘    └───────────┘
```

### Communication entre services

- **HTTP/REST** : Communication synchrone entre services via l'API Gateway
- **WebSocket (Socket.IO)** : Communication temps réel pour les parties de jeu
- **MongoDB** : Base de données principale pour les utilisateurs, quiz, parties
- **Redis** : Cache et gestion des sessions
- **MinIO** : Stockage d'objets (images, fichiers)

---

## Services et Containers

### Services Backend (Node.js)

| Service | Port | Description | Base de données |
|---------|------|-------------|-----------------|
| **api-gateway** | 3000 | Point d'entrée unique, routage, métriques | - |
| **auth-service** | 3001 | Authentification, gestion utilisateurs | MongoDB |
| **quiz-service** | 3002 | Gestion des quiz et questions | MongoDB |
| **game-service** | 3003 | Logique de jeu, WebSocket | MongoDB |
| **telegram-bot** | 3004 | Bot Telegram (optionnel) | MongoDB |

### Services Frontend (Vue.js)

| Service | Port Dev | Route Production | Description |
|---------|----------|-------------------|-------------|
| **frontend** | 5173 | `/vika-game` | Interface utilisateur (joueurs) |
| **admin-frontend** | 5174 | `/vika-admin` | Interface administrateur |

### Services Infrastructure

| Service | Port | Description |
|---------|------|-------------|
| **traefik** | 80, 8080 | Reverse proxy, load balancer, dashboard |
| **mongodb** | 27017 | Base de données NoSQL |
| **redis** | 6379 | Cache et sessions |
| **minio** | 9000, 9001 | Stockage d'objets S3-compatible |
| **prometheus** | 9090 | Collecte de métriques |
| **grafana** | 3005 | Visualisation de métriques |
| **cadvisor** | 8081 | Métriques de containers Docker |
| **node-exporter** | 9100 | Métriques système |

---

## APIs et Endpoints

### API Gateway (Port 3000)

Toutes les requêtes passent par l'API Gateway avec le préfixe `/vika-game/api` :

```
http://localhost/vika-game/api/auth/...
http://localhost/vika-game/api/quiz/...
http://localhost/vika-game/api/game/...
```

### Auth Service (Port 3001)

**Base URL** : `http://localhost:3001` (dev) ou `/vika-game/api/auth` (prod)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/auth/register` | POST | Inscription d'un utilisateur |
| `/auth/login` | POST | Connexion utilisateur |
| `/auth/admin/login` | POST | Connexion administrateur |
| `/auth/me` | GET | Informations utilisateur actuel |
| `/auth/users` | GET | Liste des utilisateurs (admin) |
| `/auth/users/:id` | GET | Détails d'un utilisateur |

**Exemple de requête** :
```json
POST /vika-game/api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Quiz Service (Port 3002)

**Base URL** : `http://localhost:3002` (dev) ou `/vika-game/api/quiz` (prod)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/quiz` | GET | Liste des quiz |
| `/quiz` | POST | Créer un quiz |
| `/quiz/:id` | GET | Détails d'un quiz |
| `/quiz/:id` | PUT | Modifier un quiz |
| `/quiz/:id` | DELETE | Supprimer un quiz |
| `/quiz/:id/questions` | GET | Questions d'un quiz |
| `/quiz/:id/questions` | POST | Ajouter une question |

### Game Service (Port 3003)

**Base URL** : `http://localhost:3003` (dev) ou `/vika-game/api/game` (prod)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/game/create` | POST | Créer une partie |
| `/game/:code` | GET | Détails d'une partie |
| `/game/:code/verify` | GET | Vérifier un code de partie |
| `/game/:code/players` | GET | Liste des joueurs connectés |
| `/game/:code/start` | POST | Démarrer une partie |
| `/game/:code/next` | POST | Question suivante |
| `/game/:code/answer` | POST | Soumettre une réponse |
| `/game/:code/scores` | GET | Classement |

**Exemple de création de partie** :
```json
POST /vika-game/api/game/create
{
  "quizId": "quiz123",
  "scheduledStartTime": "2026-01-20T10:00:00Z"
}
```

---

## WebSockets / Socket.IO

### Connexion WebSocket

Le service Game utilise Socket.IO pour la communication temps réel.

**URL de connexion** :
- **Local** : `http://localhost:3003`
- **Production** : `/socket.io` (via Traefik)

### Événements Socket.IO

#### Côté Client → Serveur

| Événement | Données | Description |
|-----------|---------|-------------|
| `register` | `{ gameCode, playerId, playerName }` | Enregistrer un joueur dans une partie |
| `answer` | `{ questionId, answer, gameCode }` | Soumettre une réponse |
| `disconnect` | - | Déconnexion du joueur |

#### Côté Serveur → Client

| Événement | Données | Description |
|-----------|---------|-------------|
| `game:started` | `{ gameCode, question }` | Partie démarrée, première question |
| `game:question` | `{ question, timeLimit }` | Nouvelle question |
| `game:answer:received` | `{ playerId, answer }` | Confirmation de réception de réponse |
| `game:scores` | `{ scores: [{ playerId, score }] }` | Classement mis à jour |
| `game:ended` | `{ finalScores }` | Partie terminée |
| `error` | `{ message }` | Erreur |

### Exemple d'utilisation (Frontend)

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3003', {
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// Enregistrement
socket.emit('register', {
  gameCode: 'ABC123',
  playerId: 'player123',
  playerName: 'John Doe'
});

// Écouter les événements
socket.on('game:question', (data) => {
  console.log('Nouvelle question:', data.question);
});

// Soumettre une réponse
socket.emit('answer', {
  questionId: 'q1',
  answer: 'Réponse A',
  gameCode: 'ABC123'
});
```

---

## Routes Traefik

### Routes Publiques

| Route | Service | Description |
|-------|---------|-------------|
| `/vika-game` | frontend | Interface utilisateur |
| `/vika-game/*` | frontend | Routes Vue.js (SPA) |
| `/vika-admin` | admin-frontend | Interface administrateur |
| `/vika-admin/*` | admin-frontend | Routes Vue.js (SPA) |
| `/vika-game/api/*` | api-gateway | API Gateway (proxie vers services) |
| `/socket.io/*` | game-service | WebSocket Socket.IO |

### Routes Monitoring

| Route | Service | Description | Priorité |
|-------|---------|-------------|----------|
| `/dashboard/` | traefik | Dashboard Traefik (via Traefik) | 30 |
| `/dashboard` | traefik | Dashboard Traefik (sans slash) | 30 |
| `/api` | traefik | API Traefik (via Traefik) | 30 |
| `/traefik-dashboard` | traefik | Dashboard Traefik (route alternative) | 30 |
| `/treafik-dashboard` | traefik | Dashboard Traefik (faute de frappe, redirection) | 50 |
| `/api-gateway-monitoring` | grafana | Dashboard Grafana API Gateway | 35 |
| `/container-monitoring` | grafana | Dashboard Grafana Containers | 35 |
| `/d/*` | grafana | Dashboards Grafana (accès direct) | 40 |
| `/login` | grafana | Page de connexion Grafana | 40 |
| `/user/*` | grafana | Routes utilisateur Grafana | 45 |
| `/api/*` | grafana | API Grafana | 40 |
| `/public/*` | grafana | Assets publics Grafana | 40 |
| `/img/*` | grafana | Images Grafana | 40 |
| `/favicon.ico` | grafana | Favicon Grafana | 40 |

### Configuration Traefik

Traefik est configuré pour :
- Détecter automatiquement les containers Docker
- Router les requêtes selon les labels Docker
- Gérer le load balancing
- Collecter les métriques pour Prometheus

**Exemple de labels Docker** :
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=PathPrefix(`/vika-game`)"
  - "traefik.http.routers.frontend.entrypoints=web"
```

---

## Monitoring

### Prometheus

**URL** : `http://localhost:9090`

Prometheus collecte les métriques de :
- API Gateway (requêtes HTTP, erreurs, latence)
- Containers Docker (via cAdvisor)
- Système (via Node Exporter)
- Services applicatifs (si exposés)

### Grafana

**URL** : `http://localhost:3005`

**Dashboards disponibles** :
1. **API Gateway Monitoring** (`/d/api-gateway-dashboard/api-gateway-monitoring`)
   - Taux d'erreur HTTP
   - Latence des requêtes
   - Requêtes par service
   - Logs d'erreurs

2. **Containers Monitoring** (`/d/containers-dashboard/containers-monitoring`)
   - CPU Usage par container
   - Memory Usage par container
   - Network I/O
   - Liste des containers actifs

**Credentials** : `admin` / `admin`

### cAdvisor

**URL** : `http://localhost:8081/metrics`

Expose les métriques Docker au format Prometheus.

---

## Credentials par défaut

### Frontend Utilisateur

**URL** : `http://localhost/vika-game`

| Type | Email | Password | Description |
|------|-------|----------|-------------|
| Utilisateur | `user@vika-game.com` | `user123` | Compte utilisateur standard |
| Admin | `admin@vika-game.com` | `admin` | Compte administrateur |

### Frontend Admin

**URL** : `http://localhost/vika-admin`

| Type | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | `admin@vika-game.com` | `admin` | Connexion administrateur |

### Grafana

**URL** : `http://localhost:3005`

| Username | Password | Description |
|----------|----------|-------------|
| `admin` | `admin` | Compte administrateur Grafana |

### Traefik Dashboard

**URLs disponibles** :
- `http://localhost:8080/dashboard/` - API directe (local uniquement, peut être bloqué par firewall)
- `http://localhost/dashboard/` - Via Traefik (recommandé)
- `http://localhost/traefik-dashboard` - Route alternative
- `http://localhost/treafik-dashboard` - Route avec faute de frappe (redirection)

Aucune authentification requise.

### MongoDB

**URL** : `mongodb://localhost:27017`

Aucune authentification par défaut (développement).

### Redis

**URL** : `redis://localhost:6379`

Aucune authentification par défaut (développement).

### MinIO

**URL** : `http://localhost:9000`

| Access Key | Secret Key | Description |
|------------|------------|-------------|
| `minioadmin` | `minioadmin` | Credentials par défaut |

---

## Démarrage et Test

### Prérequis

- Docker et Docker Compose installés
- Ports disponibles : 80, 3001-3005, 5173-5174, 8080, 8081, 9090, 27017, 6379, 9000, 9001

### Démarrage

```bash
# Cloner le repository
git clone <repository-url>
cd gameV2

# Démarrer tous les services
docker-compose up -d

# Vérifier l'état des services
docker-compose ps

# Voir les logs
docker-compose logs -f [service-name]
```

### Tests de base

#### 1. Vérifier les services

```bash
# Vérifier que tous les containers sont up
docker-compose ps

# Tester l'API Gateway
curl http://localhost/vika-game/api/auth/me

# Tester MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Tester Redis
docker-compose exec redis redis-cli ping
```

#### 2. Tester l'authentification

```bash
# Inscription
curl -X POST http://localhost/vika-game/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'

# Connexion
curl -X POST http://localhost/vika-game/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vika-game.com",
    "password": "admin"
  }'
```

#### 3. Tester les WebSockets

```javascript
// Dans la console du navigateur (sur http://localhost/vika-game)
const socket = io('http://localhost:3003', {
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connecté au serveur WebSocket');
  
  socket.emit('register', {
    gameCode: 'ABC123',
    playerId: 'test-player',
    playerName: 'Test Player'
  });
});
```

#### 4. Accéder aux interfaces

- **Frontend Utilisateur** : http://localhost/vika-game
- **Frontend Admin** : http://localhost/vika-admin
- **Grafana** : http://localhost:3005 ou http://localhost/login
- **Traefik Dashboard** : http://localhost/dashboard/ (ou http://localhost:8080/dashboard/ si firewall configuré)
- **Traefik Dashboard (alternative)** : http://localhost/traefik-dashboard
- **Prometheus** : http://localhost:9090
- **cAdvisor** : http://localhost:8081
- **Node Exporter** : http://localhost:9100/metrics

### Scénario de test complet

1. **Créer un quiz** (via admin frontend)
   - Se connecter sur `/vika-admin`
   - Créer un quiz avec des questions

2. **Créer une partie** (via admin frontend)
   - Créer une partie avec le quiz créé
   - Noter le code de partie (ex: `ABC123`)

3. **Rejoindre une partie** (via frontend utilisateur)
   - Se connecter sur `/vika-game`
   - Entrer le code de partie
   - S'enregistrer comme joueur

4. **Démarrer la partie** (via admin frontend)
   - Démarrer la partie
   - Les joueurs reçoivent les questions en temps réel

5. **Répondre aux questions** (via frontend utilisateur)
   - Les joueurs répondent aux questions
   - Le classement se met à jour en temps réel

6. **Vérifier les métriques** (via Grafana)
   - Accéder à `/container-monitoring`
   - Vérifier les métriques des containers
   - Accéder à `/api-gateway-monitoring`
   - Vérifier les métriques de l'API Gateway

---

## Structure du Projet

```
gameV2/
├── node/                    # Services Backend (Node.js)
│   ├── api-gateway/        # API Gateway (Express)
│   ├── auth-service/       # Service d'authentification
│   ├── quiz-service/       # Service de gestion des quiz
│   ├── game-service/       # Service de jeu (WebSocket)
│   └── telegram-bot/       # Bot Telegram (optionnel)
├── vue/                     # Frontends (Vue.js)
│   ├── front/              # Interface utilisateur
│   └── admin/              # Interface administrateur
├── monitoring/              # Configuration monitoring
│   ├── prometheus/         # Configuration Prometheus
│   └── grafana/            # Dashboards Grafana
├── docker-compose.yml       # Orchestration Docker
└── docs/                    # Documentation
```

---

## Variables d'environnement importantes

### Frontend

- `VITE_AUTH_SERVICE_URL` : URL du service d'authentification
- `VITE_QUIZ_SERVICE_URL` : URL du service de quiz
- `VITE_GAME_SERVICE_URL` : URL du service de jeu

### Backend

- `MONGODB_URI` : URI de connexion MongoDB
- `REDIS_URL` : URL de connexion Redis
- `JWT_SECRET` : Secret pour les tokens JWT
- `PORT` : Port d'écoute du service

---

## Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   lsof -i :80
   # Arrêter le service qui utilise le port
   ```

2. **Container ne démarre pas**
   ```bash
   # Voir les logs
   docker-compose logs [service-name]
   # Redémarrer le service
   docker-compose restart [service-name]
   ```

3. **MongoDB ne répond pas**
   ```bash
   # Vérifier que MongoDB est démarré
   docker-compose ps mongodb
   # Vérifier les logs
   docker-compose logs mongodb
   ```

4. **WebSocket ne fonctionne pas**
   ```bash
   # Vérifier que le service game est démarré
   docker-compose ps game
   # Vérifier les routes Traefik
   curl http://localhost:8080/api/http/routers
   ```

---

## Contribution

Pour contribuer au projet :

1. Créer une branche depuis `main`
2. Faire les modifications
3. Tester localement avec `docker-compose up`
4. Créer une pull request

---

## Support

Pour toute question ou problème :
- Vérifier les logs : `docker-compose logs [service-name]`
- Vérifier les métriques : http://localhost:3005
- Vérifier les routes Traefik : http://localhost:8080/dashboard/

---

**Dernière mise à jour** : Janvier 2026


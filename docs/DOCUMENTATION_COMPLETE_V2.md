# 📚 Documentation Complète - IntelectGame V2

**Version**: 2.0  
**Dernière mise à jour**: Décembre 2024  
**Auteur**: Équipe IntelectGame

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du Projet](#architecture-du-projet)
3. [Microservices Détaillés](#microservices-détaillés)
4. [API et Endpoints](#api-et-endpoints)
5. [Déploiement Kubernetes](#déploiement-kubernetes)
6. [Base de Données](#base-de-données)
7. [WebSocket et Communication Temps Réel](#websocket-et-communication-temps-réel)
8. [Internationalisation](#internationalisation)
9. [CI/CD et Docker](#cicd-et-docker)
10. [Monitoring et Observabilité](#monitoring-et-observabilité)
11. [Sécurité](#sécurité)
12. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

**IntelectGame V2** est une application de quiz en temps réel construite avec une architecture microservices moderne. L'application permet à des administrateurs de créer et gérer des quiz, et à des joueurs de participer en temps réel via une interface web ou un bot Telegram.

### Caractéristiques Principales

- ✅ **Architecture Microservices** : 4 services backend indépendants
- ✅ **Temps Réel** : WebSocket pour mises à jour instantanées
- ✅ **Multi-plateforme** : Interface web (Vue.js) + Bot Telegram
- ✅ **Internationalisation** : Support FR, EN, RU
- ✅ **Scalable** : Déploiement Kubernetes avec réplicas
- ✅ **Monitoring** : Grafana + Loki pour logs centralisés
- ✅ **CI/CD** : GitHub Actions pour build et déploiement automatique

### Technologies Principales

| Catégorie | Technologies |
|-----------|--------------|
| **Backend** | Node.js 20, Express.js, Socket.io |
| **Frontend** | Vue.js 3, Vite, Tailwind CSS |
| **Base de données** | MongoDB 7.0 |
| **Orchestration** | Kubernetes (Minikube) |
| **Conteneurisation** | Docker |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Grafana, Loki, Promtail |
| **Proxy** | Nginx |

---

## Architecture du Projet

### Structure des Répertoires

```
gameV2/
├── node/                          # Services backend
│   ├── auth-service/              # Service d'authentification (Port 3001)
│   │   ├── config/
│   │   │   └── database.js        # Configuration MongoDB
│   │   ├── controllers/
│   │   │   └── auth.controller.js # Logique métier
│   │   ├── models/
│   │   │   └── User.js            # Modèle Mongoose
│   │   ├── routes/
│   │   │   └── auth.routes.js     # Routes Express
│   │   ├── data/
│   │   │   └── users.json         # Fallback JSON
│   │   ├── server.js              # Point d'entrée
│   │   └── Dockerfile
│   │
│   ├── quiz-service/              # Service de gestion des questions (Port 3002)
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── quiz.controller.js
│   │   ├── models/
│   │   │   └── Question.js
│   │   ├── routes/
│   │   │   └── quiz.routes.js
│   │   ├── data/
│   │   │   └── questions.json
│   │   ├── server.js
│   │   └── Dockerfile
│   │
│   ├── game-service/               # Service de jeu avec WebSocket (Port 3003)
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── services.js        # URLs des autres services
│   │   ├── controllers/
│   │   │   └── game.controller.js
│   │   ├── models/
│   │   │   ├── GameState.js
│   │   │   └── Score.js
│   │   ├── routes/
│   │   │   └── game.routes.js
│   │   ├── data/
│   │   │   ├── gameState.json
│   │   │   └── scores.json
│   │   ├── gameState.js            # Gestion de l'état du jeu
│   │   ├── server.js               # Serveur Express + Socket.io
│   │   └── Dockerfile
│   │
│   └── telegram-bot/               # Bot Telegram (Port 3004)
│       ├── server.js                # Logique du bot
│       ├── translations.js          # Traductions EN/RU
│       └── Dockerfile
│
├── vue/                            # Application frontend
│   ├── front/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── admin/          # Composants admin
│   │   │   │   │   ├── AdminDashboard.vue
│   │   │   │   │   ├── AdminLogin.vue
│   │   │   │   │   ├── AdminNavbar.vue
│   │   │   │   │   └── ManageQuestions.vue
│   │   │   │   └── player/        # Composants joueur
│   │   │   │       ├── Leaderboard.vue
│   │   │   │       ├── PlayerNavbar.vue
│   │   │   │       ├── PlayerRegister.vue
│   │   │   │       └── QuizPlay.vue
│   │   │   ├── composables/
│   │   │   │   └── useI18n.js     # Internationalisation
│   │   │   ├── config/
│   │   │   │   └── api.js          # Configuration API
│   │   │   ├── services/
│   │   │   │   └── socketService.js # Singleton WebSocket
│   │   │   ├── router/
│   │   │   │   └── index.js
│   │   │   └── App.vue
│   │   ├── package.json
│   │   └── vite.config.js
│   └── Dockerfile
│
├── k8s/                            # Configurations Kubernetes
│   ├── all-services.yaml            # Tous les services en un fichier
│   ├── mongodb-deployment.yaml      # Déploiement MongoDB
│   ├── nginx-proxy-config.yaml     # Configuration Nginx
│   ├── monitoring/                  # Stack de monitoring
│   │   ├── grafana-deployment.yaml
│   │   ├── loki-deployment.yaml
│   │   ├── promtail-daemonset.yaml
│   │   └── scripts/                # Scripts d'administration
│   └── scripts/                     # Scripts de déploiement
│
├── .github/
│   └── workflows/
│       └── docker-build-push.yml     # CI/CD GitHub Actions
│
├── docker-compose.yml               # Configuration Docker Compose
└── README.md
```

### Architecture Microservices

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Vue.js)                       │
│                    Port: 5173 (dev) / 80 (prod)                 │
│                    Build: Vite (static files)                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTP/WebSocket
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
        ┌───────────────┐              ┌───────────────┐
        │  Nginx Proxy  │              │ Telegram Bot │
        │  (K8s)        │              │  (K8s)       │
        │  Port: 30081  │              │  Port: 3004  │
        └───────┬───────┘              └───────┬───────┘
                │                               │
                │                               │
                ├───────────┬───────────┬───────┘
                │           │           │
                ▼           ▼           ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  Auth   │  │  Quiz    │  │  Game    │
        │ Service │  │ Service  │  │ Service  │
        │ :3001   │  │ :3002    │  │ :3003   │
        │ (2 pods)│  │ (2 pods) │  │ (2 pods) │
        └────┬────┘  └────┬─────┘  └────┬─────┘
             │            │              │
             │            │              │
             └────────────┴──────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   MongoDB     │
                    │   :27017      │
                    │   (1 pod)     │
                    └───────────────┘
```

### Flux de Données

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTP Request
       ▼
┌─────────────┐
│ Nginx Proxy │  ──→ Route /api/auth → auth-service:3001
│  :30081     │  ──→ Route /api/quiz → quiz-service:3002
└──────┬──────┘  ──→ Route /api/game → game-service:3003
       │         ──→ Route /socket.io → game-service:3003 (WebSocket)
       │         ──→ Route / → frontend:80
       │
       │ WebSocket Upgrade
       ▼
┌─────────────┐
│game-service │  ──→ HTTP → auth-service (vérifier joueur)
│  :3003      │  ──→ HTTP → quiz-service (obtenir questions)
└──────┬──────┘  ──→ MongoDB → Sauvegarder scores
       │
       │ WebSocket Events
       ▼
┌─────────────┐
│   Clients   │  ←─ players:count
│  (All)      │  ←─ game:started
└─────────────┘  ←─ question:next
                ←─ leaderboard:update
```

---

## Microservices Détaillés

### 1. auth-service (Port 3001)

**Rôle**: Gestion de l'authentification et des utilisateurs

**Fonctionnalités**:
- Connexion admin (username/password)
- Inscription des joueurs (nom unique)
- Récupération de la liste des joueurs
- Récupération des détails d'un joueur

**Base de données**:
- Collection MongoDB: `users`
- Fallback: `data/users.json`

**Schéma User**:
```javascript
{
  _id: ObjectId,
  id: String,           // ID unique (ex: "p1234567890")
  name: String,         // Nom du joueur
  createdAt: Date
}
```

**Replicas K8s**: 2 pods

**Endpoints**:
- `GET /test` - Health check
- `POST /admin/login` - Connexion admin
- `POST /players/register` - Inscription joueur
- `GET /players` - Liste tous les joueurs
- `GET /players/:id` - Détails d'un joueur

---

### 2. quiz-service (Port 3002)

**Rôle**: Gestion des questions du quiz

**Fonctionnalités**:
- CRUD complet des questions
- Récupération des questions (avec/sans réponses)
- Validation des données

**Base de données**:
- Collection MongoDB: `questions`
- Fallback: `data/questions.json`

**Schéma Question**:
```javascript
{
  _id: ObjectId,
  id: String,           // ID unique (ex: "q1234567890")
  question: String,      // Texte de la question
  choices: [String],     // Array de choix (ex: ["A", "B", "C", "D"])
  answer: String,       // Réponse correcte
  createdAt: Date
}
```

**Replicas K8s**: 2 pods

**Endpoints**:
- `GET /test` - Health check
- `GET /all` - Questions sans réponses (pour joueurs)
- `GET /questions` - Alias pour `/all`
- `GET /full` - Questions avec réponses (pour admin)
- `POST /create` - Créer une question
- `PUT /:id` - Modifier une question
- `DELETE /:id` - Supprimer une question

---

### 3. game-service (Port 3003)

**Rôle**: Orchestration du jeu et gestion des scores

**Fonctionnalités**:
- Gestion de l'état du jeu (gameState)
- Réception des réponses des joueurs
- Calcul des scores en temps réel
- WebSocket pour mises à jour temps réel
- Génération de codes de partie (6 caractères)
- Synchronisation du timer serveur
- Gestion des joueurs connectés

**Base de données**:
- Collection MongoDB: `gamestates` (singleton avec `key: "current"`)
- Collection MongoDB: `scores`
- Fallback: `data/gameState.json`, `data/scores.json`

**Schéma GameState**:
```javascript
{
  _id: ObjectId,
  key: "current",                    // Toujours "current" (singleton)
  isStarted: Boolean,
  currentQuestionIndex: Number,
  currentQuestionId: String,
  questionStartTime: Number,         // Timestamp
  questionDuration: Number,          // Durée en ms
  connectedPlayers: [String],        // Array de playerIds
  gameSessionId: String,
  gameCode: String,                  // Code à 6 caractères (ex: "ABC123")
  answers: {                         // Nested object
    [playerId]: {
      [questionId]: String           // Réponse du joueur
    }
  },
  results: {                         // Nested object
    [questionId]: {
      correctAnswer: String,
      playerResults: [{
        playerId: String,
        answer: String,
        isCorrect: Boolean
      }]
    }
  }
}
```

**Schéma Score**:
```javascript
{
  _id: ObjectId,
  playerId: String,      // ID du joueur
  playerName: String,    // Nom du joueur (mis à jour dynamiquement)
  score: Number          // Score total
}
```

**Replicas K8s**: 2 pods (avec Session Affinity pour WebSocket)

**Endpoints HTTP**:
- `GET /test` - Health check
- `GET /state` - État actuel du jeu
- `GET /code` - Code de la partie
- `POST /verify-code` - Vérifier un code
- `POST /start` - Démarrer le jeu (`{questionDuration}`)
- `POST /answer` - Soumettre une réponse
- `POST /next` - Question suivante
- `POST /end` - Terminer le jeu
- `DELETE /delete` - Supprimer la partie
- `GET /score/:playerId` - Score d'un joueur
- `GET /leaderboard` - Classement
- `GET /players/count` - Nombre de joueurs connectés
- `GET /players` - Liste des joueurs connectés avec noms
- `GET /results` - Résultats des questions

**WebSocket Events** (Socket.io):
- **Client → Serveur**: `register` (`{playerId}`)
- **Serveur → Clients**: 
  - `connect` - Connexion établie
  - `players:count` - Mise à jour du nombre de joueurs
  - `game:started` - Jeu démarré
  - `question:next` - Nouvelle question
  - `game:ended` - Jeu terminé
  - `leaderboard:update` - Mise à jour du classement
  - `game:deleted` - Partie supprimée

**Dépendances**:
- Appelle `auth-service` pour vérifier les joueurs
- Appelle `quiz-service` pour obtenir les questions

---

### 4. telegram-bot (Port 3004)

**Rôle**: Interface Telegram pour les joueurs

**Fonctionnalités**:
- Commandes `/start` - Démarrer le bot
- Sélection de langue (EN/RU)
- Vérification du code de partie
- Inscription du joueur
- Réception des questions via WebSocket
- Envoi des réponses via boutons inline
- Affichage du classement final

**Configuration**:
- Token Telegram stocké dans Kubernetes Secret
- Connexion WebSocket au `game-service`
- Support multi-langues (EN/RU)

**Replicas K8s**: 1 pod (pour éviter les conflits 409)

**Dépendances**:
- Appelle `game-service` pour vérifier le code
- Appelle `auth-service` pour enregistrer le joueur
- Connexion WebSocket au `game-service`

---

### 5. frontend (Port 5173 dev / 80 prod)

**Rôle**: Interface utilisateur web

**Fonctionnalités**:
- **Interface Admin**:
  - Connexion admin
  - Dashboard avec état du jeu
  - Gestion des questions (CRUD)
  - Contrôle du jeu (start/next/end)
  - Affichage des joueurs connectés
  - Partage du code de partie (WhatsApp, Telegram)
  
- **Interface Joueur**:
  - Inscription avec code de partie
  - Affichage des questions en temps réel
  - Timer synchronisé serveur
  - Classement en temps réel
  - Design responsive (mobile/tablet/desktop)

- **Internationalisation**:
  - Support FR (défaut), EN, RU
  - Sélecteur de langue dans la navbar
  - Persistance dans localStorage

**Technologies**:
- Vue.js 3 (Composition API)
- Vite (build tool)
- Tailwind CSS (styling)
- Socket.io Client (WebSocket)
- Axios (HTTP client)

**Build**:
- Production: Build statique avec Vite
- Assets optimisés et minifiés
- Variables d'environnement injectées au build

**Replicas K8s**: 2 pods

---

### 6. nginx-proxy (K8s)

**Rôle**: Reverse proxy et routage

**Fonctionnalités**:
- Routage des requêtes HTTP
- Support WebSocket (upgrade HTTP → WebSocket)
- Point d'entrée public (NodePort 30081)
- Headers de proxy correctement configurés

**Routage**:
| Chemin Client | Route Vers | Service |
|---------------|------------|---------|
| `/` | `http://frontend:80` | Frontend |
| `/api/auth/*` | `http://auth-service:3001/auth/*` | Auth Service |
| `/api/quiz/*` | `http://quiz-service:3002/quiz/*` | Quiz Service |
| `/api/game/*` | `http://game-service:3003/game/*` | Game Service |
| `/socket.io` | `http://game-service:3003` | Game Service (WebSocket) |
| `/grafana/` | `http://grafana:3000/` | Grafana (monitoring) |

**Configuration WebSocket**:
- `proxy_http_version 1.1`
- `proxy_set_header Upgrade $http_upgrade`
- `proxy_set_header Connection $connection_upgrade`
- `proxy_buffering off`
- Timeouts: `proxy_read_timeout 86400`

**Replicas K8s**: 1 pod

---

## API et Endpoints

### Configuration des URLs

#### En Développement
```javascript
AUTH_SERVICE: "http://localhost:3001"
QUIZ_SERVICE: "http://localhost:3002"
GAME_SERVICE: "http://localhost:3003"
WEBSOCKET: "http://localhost:3003"
```

#### En Production (Kubernetes)
```javascript
AUTH_SERVICE: "/api/auth"  // Via Nginx
QUIZ_SERVICE: "/api/quiz"  // Via Nginx
GAME_SERVICE: "/api/game"  // Via Nginx
WEBSOCKET: "/socket.io"    // Via Nginx
```

### Auth Service API

**Base URL**: `http://localhost:3001` (dev) ou `/api/auth` (prod)

| Méthode | Endpoint | Description | Auth | Body |
|---------|----------|-------------|------|------|
| `GET` | `/test` | Test de santé | ❌ | - |
| `POST` | `/admin/login` | Connexion admin | ❌ | `{username, password}` |
| `POST` | `/players/register` | Inscription joueur | ❌ | `{name}` |
| `GET` | `/players` | Liste tous les joueurs | ❌ | - |
| `GET` | `/players/:id` | Détails d'un joueur | ❌ | - |

**Exemples**:
```bash
# Connexion admin
POST /api/auth/admin/login
{
  "username": "admin",
  "password": "admin"
}

# Inscription joueur
POST /api/auth/players/register
{
  "name": "Alice"
}
```

---

### Quiz Service API

**Base URL**: `http://localhost:3002` (dev) ou `/api/quiz` (prod)

| Méthode | Endpoint | Description | Auth | Body |
|---------|----------|-------------|------|------|
| `GET` | `/test` | Test de santé | ❌ | - |
| `GET` | `/all` | Questions sans réponses | ❌ | - |
| `GET` | `/questions` | Alias pour `/all` | ❌ | - |
| `GET` | `/full` | Questions avec réponses | ✅ | - |
| `POST` | `/create` | Créer une question | ✅ | `{question, choices[], answer}` |
| `PUT` | `/:id` | Modifier une question | ✅ | `{question, choices[], answer}` |
| `DELETE` | `/:id` | Supprimer une question | ✅ | - |

**Exemples**:
```bash
# Créer une question
POST /api/quiz/create
{
  "question": "Quelle est la capitale de la France ?",
  "choices": ["Berlin", "Madrid", "Paris", "Rome"],
  "answer": "Paris"
}

# Récupérer toutes les questions (sans réponses)
GET /api/quiz/all
```

---

### Game Service API

**Base URL**: `http://localhost:3003` (dev) ou `/api/game` (prod)

| Méthode | Endpoint | Description | Auth | Body |
|---------|----------|-------------|------|------|
| `GET` | `/test` | Test de santé | ❌ | - |
| `GET` | `/state` | État actuel du jeu | ❌ | - |
| `GET` | `/code` | Code de la partie | ❌ | - |
| `POST` | `/verify-code` | Vérifier un code | ❌ | `{gameCode}` |
| `POST` | `/start` | Démarrer le jeu | ✅ | `{questionDuration}` |
| `POST` | `/answer` | Soumettre une réponse | ❌ | `{playerId, questionId, answer}` |
| `POST` | `/next` | Question suivante | ✅ | - |
| `POST` | `/end` | Terminer le jeu | ✅ | - |
| `DELETE` | `/delete` | Supprimer la partie | ✅ | - |
| `GET` | `/score/:playerId` | Score d'un joueur | ❌ | - |
| `GET` | `/leaderboard` | Classement | ❌ | - |
| `GET` | `/players/count` | Nombre de joueurs connectés | ❌ | - |
| `GET` | `/players` | Liste des joueurs connectés | ❌ | - |
| `GET` | `/results` | Résultats des questions | ❌ | - |

**Exemples**:
```bash
# Démarrer le jeu (30 secondes par question)
POST /api/game/start
{
  "questionDuration": 30
}

# Soumettre une réponse
POST /api/game/answer
{
  "playerId": "p1234567890",
  "questionId": "q1234567890",
  "answer": "Paris"
}

# Obtenir le classement
GET /api/game/leaderboard
```

---

### WebSocket Events (Socket.io)

**Connection**: `http://localhost:3003` (dev) ou `/socket.io` (prod)

#### Événements Émis par le Client

| Événement | Description | Payload |
|-----------|-------------|---------|
| `register` | Enregistrer un joueur | `{playerId}` |

#### Événements Émis par le Serveur

| Événement | Description | Payload |
|-----------|-------------|---------|
| `connect` | Connexion établie | `{socketId}` |
| `players:count` | Mise à jour du nombre de joueurs | `{count}` |
| `game:started` | Jeu démarré | `{questionIndex, totalQuestions, gameCode}` |
| `question:next` | Nouvelle question | `{question, questionIndex, totalQuestions, startTime, duration}` |
| `game:ended` | Jeu terminé | `{message, leaderboard?}` |
| `leaderboard:update` | Mise à jour du classement | `[{playerId, playerName, score}]` |
| `game:deleted` | Partie supprimée | `{message}` |

**Exemple d'Utilisation**:
```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3003', {
  path: '/socket.io',
  transports: ['polling', 'websocket']
})

socket.on('connect', () => {
  socket.emit('register', { playerId: 'p1234567890' })
})

socket.on('question:next', (data) => {
  console.log('Nouvelle question:', data.question)
})
```

---

## Déploiement Kubernetes

### Architecture Kubernetes

```
Namespace: intelectgame
│
├── ConfigMap: app-config
│   └── Variables d'environnement partagées
│
├── Secret: telegram-bot-secret
│   └── TELEGRAM_BOT_TOKEN
│
├── PersistentVolumeClaim: mongodb-pvc
│   └── 5Gi storage
│
├── Deployments (avec Replicas)
│   ├── mongodb (1 replica)
│   ├── auth-service (2 replicas)
│   ├── quiz-service (2 replicas)
│   ├── game-service (2 replicas) [Session Affinity]
│   ├── telegram-bot (1 replica)
│   ├── frontend (2 replicas)
│   ├── nginx-proxy (1 replica)
│   ├── grafana (1 replica)
│   ├── loki (1 replica)
│   └── promtail (DaemonSet)
│
└── Services (ClusterIP sauf nginx-proxy: NodePort)
    ├── mongodb (ClusterIP :27017)
    ├── auth-service (ClusterIP :3001)
    ├── quiz-service (ClusterIP :3002)
    ├── game-service (ClusterIP :3003) [Session Affinity]
    ├── telegram-bot (ClusterIP :3004)
    ├── frontend (ClusterIP :80)
    ├── nginx-proxy (NodePort :30081)
    ├── grafana (ClusterIP :3000)
    └── loki (ClusterIP :3100)
```

### Composants Kubernetes Détaillés

#### 1. Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: intelectgame
```

**Rôle**: Isolation de toutes les ressources de l'application.

---

#### 2. ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: intelectgame
data:
  MONGODB_URI: "mongodb://mongodb:27017/intelectgame"
  AUTH_SERVICE_URL: "http://auth-service:3001"
  QUIZ_SERVICE_URL: "http://quiz-service:3002"
  GAME_SERVICE_URL: "http://game-service:3003"
  NODE_ENV: "production"
```

**Rôle**: Centralise les variables d'environnement partagées entre les services.

---

#### 3. Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: telegram-bot-secret
  namespace: intelectgame
type: Opaque
stringData:
  TELEGRAM_BOT_TOKEN: "YOUR_TOKEN"
```

**Rôle**: Stocke de manière sécurisée le token Telegram Bot.

**Création**:
```bash
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="your_token_here" \
  -n intelectgame
```

---

#### 4. PersistentVolumeClaim (MongoDB)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: intelectgame
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
```

**Rôle**: Fournit un stockage persistant pour MongoDB (les données survivent aux redémarrages).

---

#### 5. MongoDB Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: intelectgame
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: mongodb
        image: mongo:7.0
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongodb-data
          mountPath: /data/db
        livenessProbe:
          exec:
            command: ["mongosh", "--eval", "db.adminCommand('ping')"]
          initialDelaySeconds: 30
        readinessProbe:
          exec:
            command: ["mongosh", "--eval", "db.adminCommand('ping')"]
          initialDelaySeconds: 5
      volumes:
      - name: mongodb-data
        persistentVolumeClaim:
          claimName: mongodb-pvc
```

**Rôle**: 
- Base de données MongoDB
- Health checks (liveness/readiness)
- Stockage persistant via PVC

---

#### 6. Service Deployments (Exemple: auth-service)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: intelectgame
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    spec:
      containers:
      - name: auth-service
        image: thismann17/gamev2-auth-service:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3001
        env:
        - name: MONGODB_URI
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: MONGODB_URI
        volumeMounts:
        - name: data-volume
          mountPath: /app/data
      volumes:
      - name: data-volume
        emptyDir: {}
```

**Caractéristiques**:
- 2 replicas pour haute disponibilité
- Image DockerHub `thismann17/gamev2-auth-service:latest`
- `imagePullPolicy: Always` pour toujours récupérer la dernière version
- Volume `emptyDir` pour données temporaires (JSON fallback)

---

#### 7. Game Service (Session Affinity)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: game-service
  namespace: intelectgame
spec:
  type: ClusterIP
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800  # 3 heures
```

**Rôle Critique**: 
- **Session Affinity** garantit que toutes les requêtes WebSocket d'un même client IP vont vers le même pod
- **Nécessaire** pour éviter les erreurs 400 lors de l'upgrade WebSocket
- Timeout de 3 heures (suffisant pour une session de jeu)

---

#### 8. Nginx Proxy Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-proxy
  namespace: intelectgame
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/nginx.conf
      volumes:
      - name: nginx-config
        configMap:
          name: nginx-proxy-config
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-proxy
  namespace: intelectgame
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30081
```

**Rôle**:
- Reverse proxy pour routage des requêtes
- Support WebSocket (upgrade HTTP → WebSocket)
- Point d'entrée public (NodePort 30081)

---

### Déploiement

#### Prérequis

```bash
# Installer Minikube
minikube start

# Activer le tunnel pour accès public (si nécessaire)
minikube tunnel
```

#### Déploiement Complet

```bash
# 1. Déployer MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# 2. Déployer tous les services
kubectl apply -f k8s/all-services.yaml

# 3. Déployer le proxy Nginx
kubectl apply -f k8s/nginx-proxy-config.yaml

# 4. Déployer le monitoring (optionnel)
kubectl apply -f k8s/monitoring/

# 5. Vérifier le statut
kubectl get pods -n intelectgame
kubectl get services -n intelectgame
```

#### Accès Public

```bash
# Obtenir l'IP du nœud Minikube
minikube ip

# Accéder via NodePort
http://<MINIKUBE_IP>:30081

# Ou via tunnel (expose automatiquement)
minikube tunnel
# Puis accéder via l'IP publique de la VM
```

---

### Images Docker

Toutes les images sont poussées sur DockerHub sous le namespace `thismann17`:

- `thismann17/gamev2-auth-service:latest`
- `thismann17/gamev2-quiz-service:latest`
- `thismann17/gamev2-game-service:latest`
- `thismann17/gamev2-frontend:latest`
- `thismann17/gamev2-telegram-bot:latest`

**Build automatique**: GitHub Actions (`.github/workflows/docker-build-push.yml`)

---

## Base de Données

### MongoDB Collections

#### Collection: `users`

```javascript
{
  _id: ObjectId,
  id: String,           // ID unique du joueur (ex: "p1234567890")
  name: String,         // Nom du joueur
  createdAt: Date
}
```

**Index recommandés**:
```javascript
db.users.createIndex({ id: 1 }, { unique: true })
db.users.createIndex({ name: 1 })
```

---

#### Collection: `questions`

```javascript
{
  _id: ObjectId,
  id: String,           // ID unique de la question (ex: "q1234567890")
  question: String,     // Texte de la question
  choices: [String],    // Array de choix (ex: ["A", "B", "C", "D"])
  answer: String,       // Réponse correcte
  createdAt: Date
}
```

**Index recommandés**:
```javascript
db.questions.createIndex({ id: 1 }, { unique: true })
```

---

#### Collection: `gamestates`

```javascript
{
  _id: ObjectId,
  key: "current",       // Toujours "current" (singleton)
  isStarted: Boolean,
  currentQuestionIndex: Number,
  currentQuestionId: String,
  questionStartTime: Number,    // Timestamp
  questionDuration: Number,      // Durée en ms
  connectedPlayers: [String],   // Array de playerIds
  gameSessionId: String,
  gameCode: String,             // Code à 6 caractères (ex: "ABC123")
  answers: {                    // Nested object
    [playerId]: {
      [questionId]: String      // Réponse du joueur
    }
  },
  results: {                    // Nested object
    [questionId]: {
      correctAnswer: String,
      playerResults: [{
        playerId: String,
        answer: String,
        isCorrect: Boolean
      }]
    }
  }
}
```

**Index recommandés**:
```javascript
db.gamestates.createIndex({ key: 1 }, { unique: true })
```

---

#### Collection: `scores`

```javascript
{
  _id: ObjectId,
  playerId: String,     // ID du joueur
  playerName: String,   // Nom du joueur (mis à jour dynamiquement)
  score: Number         // Score total
}
```

**Index recommandés**:
```javascript
db.scores.createIndex({ playerId: 1 }, { unique: true })
db.scores.createIndex({ score: -1 })  // Pour leaderboard (tri décroissant)
```

---

### Schéma de Relations

```
users (1) ──┐
            │
            ├──→ scores (N) ──→ playerId, playerName
            │
questions (N) ──┐
                │
                └──→ gamestates.answers (N) ──→ questionId
                │
                └──→ gamestates.results (N) ──→ questionId
```

---

### Migration JSON → MongoDB

Les services supportent un **fallback JSON** si MongoDB n'est pas disponible :

- `node/auth-service/data/users.json`
- `node/quiz-service/data/questions.json`
- `node/game-service/data/gameState.json`
- `node/game-service/data/scores.json`

**Logique**: Si `MONGODB_URI` n'est pas défini, les services utilisent les fichiers JSON.

---

## WebSocket et Communication Temps Réel

### Configuration Socket.io

**Côté Serveur** (`game-service/server.js`):

```javascript
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  serveClient: false,
  transports: ['polling', 'websocket'],
  allowRequest: (req, callback) => {
    // Accepter toutes les requêtes
    callback(null, true)
  }
})
```

**Côté Client** (`vue/front/src/services/socketService.js`):

```javascript
const socket = io(wsUrl, {
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  reconnection: true,
  forceNew: false
})
```

**Singleton Pattern**: Un seul WebSocket connection partagé entre tous les composants Vue.

---

### Gestion des Connexions

1. **Connexion Initiale**: Client se connecte via polling
2. **Upgrade WebSocket**: Si supporté, upgrade automatique vers WebSocket
3. **Reconnexion**: Automatique en cas de déconnexion
4. **Session Affinity**: K8s garantit que le même pod gère la connexion

---

### Événements Critiques

#### `register` (Client → Serveur)

```javascript
socket.emit('register', { playerId: 'p1234567890' })
```

**Action Serveur**:
- Ajoute `playerId` à `gameState.connectedPlayers`
- Émet `players:count` à tous les clients
- Si jeu déjà démarré, envoie la question actuelle

---

#### `question:next` (Serveur → Clients)

```javascript
{
  question: {
    id: 'q1',
    question: 'Quelle est la capitale ?',
    choices: ['A', 'B', 'C', 'D']
  },
  questionIndex: 0,
  totalQuestions: 10,
  startTime: 1234567890,
  duration: 30000
}
```

**Action Client**:
- Affiche la question
- Démarre le timer (synchronisé avec `startTime`)
- Désactive les boutons après réponse

---

### Configuration Nginx pour WebSocket

```nginx
location /socket.io {
    set $game "game-service.intelectgame.svc.cluster.local:3003";
    proxy_pass http://$game;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
    proxy_buffering off;
}
```

---

## Internationalisation

### Langues Supportées

- **Français (fr)**: Langue par défaut
- **English (en)**: Traduction complète
- **Русский (ru)**: Traduction complète

### Implémentation

**Composable Vue** (`vue/front/src/composables/useI18n.js`):

```javascript
import { useI18n } from '@/composables/useI18n'

const { t, language, changeLanguage } = useI18n()
```

**Utilisation**:

```vue
<template>
  <h1>{{ t('admin.dashboard.title') }}</h1>
  <button @click="changeLanguage('en')">English</button>
</template>
```

**Stockage**: `localStorage.getItem('gameLanguage')` (persiste entre sessions)

---

### Clés de Traduction

Structure: `[component].[key]`

Exemples:
- `admin.dashboard.title`
- `quiz.waiting`
- `register.enterCode`
- `leaderboard.title`

---

## CI/CD et Docker

### GitHub Actions Workflow

**Fichier**: `.github/workflows/docker-build-push.yml`

**Déclencheurs**:
- Push sur `main` ou `develop`
- Pull Request

**Actions**:
1. Build des images Docker pour chaque service
2. Push vers DockerHub (`thismann17/gamev2-*`)
3. Tag avec `latest` et commit SHA

**Secrets GitHub**:
- `DOCKER_USERNAME`: Nom d'utilisateur DockerHub
- `DOCKER_PASSWORD`: Mot de passe DockerHub
- `TELEGRAM_BOT_TOKEN`: Token du bot Telegram

---

### Dockerfiles

Tous les services utilisent `node:20-alpine` comme image de base.

**Structure typique**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build  # Si nécessaire

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3001
CMD ["node", "server.js"]
```

---

## Monitoring et Observabilité

### Stack de Monitoring

**Grafana + Loki + Promtail**

- **Grafana**: Interface de visualisation des logs
- **Loki**: Système d'agrégation de logs
- **Promtail**: Agent de collecte de logs (DaemonSet)

**Accès**: `http://<IP>:30081/grafana/` (via Nginx proxy)

**Credentials**:
- Username: `admin`
- Password: `admin123`

---

### Logs Collectés

- Logs de tous les pods dans le namespace `intelectgame`
- Logs structurés avec labels Kubernetes
- Recherche par namespace, pod, container

**Requêtes Loki**:
```
{namespace="intelectgame"}                    # Tous les logs
{namespace="intelectgame", app="game-service"} # Logs game-service
{namespace="intelectgame"} |= "error"         # Toutes les erreurs
```

---

## Sécurité

### Bonnes Pratiques Implémentées

1. **Secrets Kubernetes**: Token Telegram stocké dans Secret
2. **CORS**: Configuré pour autoriser les requêtes cross-origin
3. **Session Affinity**: Protection contre les attaques WebSocket
4. **Health Checks**: Détection automatique des pods défaillants
5. **Isolation**: Namespace Kubernetes pour isolation

### Recommandations Futures

1. **HTTPS/TLS**: Certificats SSL pour communication sécurisée
2. **Rate Limiting**: Limitation du nombre de requêtes par IP
3. **Authentication JWT**: Tokens JWT pour authentification API
4. **Input Validation**: Validation stricte des entrées utilisateur
5. **Secrets Management**: Vault ou équivalent pour gestion des secrets

---

## Troubleshooting

### Problèmes Courants

#### 1. WebSocket 400 Bad Request

**Symptôme**: Erreur `400 (Bad Request)` lors de la connexion WebSocket

**Solutions**:
- Vérifier que `sessionAffinity: ClientIP` est configuré sur le service `game-service`
- Vérifier la configuration Nginx pour WebSocket
- Vérifier que `path: '/socket.io'` est correctement configuré

---

#### 2. Score toujours à 0

**Symptôme**: Les scores ne sont pas calculés correctement

**Solutions**:
- Vérifier la normalisation des réponses (trim, lowercase)
- Vérifier que `calculateQuestionResults` est appelé après chaque question
- Vérifier les logs MongoDB pour voir si les scores sont sauvegardés

---

#### 3. Port 30081 non accessible

**Symptôme**: Impossible d'accéder à l'application via l'IP publique

**Solutions**:
- Utiliser `kubectl port-forward` pour accès local
- Vérifier le firewall du cloud provider
- Utiliser `minikube tunnel` pour exposer les services

---

#### 4. Grafana non accessible

**Symptôme**: Impossible d'accéder à Grafana via `/grafana/`

**Solutions**:
- Vérifier que le service Grafana est en `ClusterIP` (pas `LoadBalancer`)
- Vérifier la configuration Nginx pour `/grafana/`
- Utiliser `kubectl port-forward -n intelectgame service/grafana 3000:3000`

---

### Commandes Utiles

```bash
# Voir tous les pods
kubectl get pods -n intelectgame

# Voir les logs d'un service
kubectl logs -f deployment/game-service -n intelectgame

# Redémarrer un service
kubectl rollout restart deployment/game-service -n intelectgame

# Voir les événements
kubectl get events -n intelectgame --sort-by='.lastTimestamp'

# Port-forward pour accès local
kubectl port-forward -n intelectgame service/nginx-proxy 8080:80

# Accéder à un pod
kubectl exec -it <pod-name> -n intelectgame -- sh
```

---

## Conclusion

Cette documentation couvre l'architecture complète d'IntelectGame V2, incluant :

✅ **Architecture microservices** avec 4 services backend + frontend + bot Telegram  
✅ **API REST complète** avec tous les endpoints  
✅ **Déploiement Kubernetes** détaillé avec Minikube  
✅ **WebSocket temps réel** pour les mises à jour  
✅ **Base de données MongoDB** avec schémas et index  
✅ **Internationalisation** multi-langues  
✅ **CI/CD** avec GitHub Actions  
✅ **Monitoring** avec Grafana + Loki  

Pour les améliorations et le workflow de test/déploiement, voir **AMELIORATION_ARCHITECTURE_V2.md**.

---

**Version**: 2.0  
**Dernière mise à jour**: Décembre 2024


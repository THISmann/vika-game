# 📚 Documentation Complète - IntelectGame V2

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du Projet](#architecture-du-projet)
3. [API et Endpoints](#api-et-endpoints)
4. [Déploiement Kubernetes (Minikube)](#déploiement-kubernetes-minikube)
5. [Flux de Communication](#flux-de-communication)
6. [Base de Données](#base-de-données)
7. [WebSocket et Temps Réel](#websocket-et-temps-réel)
8. [Internationalisation](#internationalisation)

---

## Vue d'ensemble

**IntelectGame V2** est une application de quiz en temps réel construite avec une architecture microservices. L'application permet à des administrateurs de créer et gérer des quiz, et à des joueurs de participer en temps réel via une interface web ou Telegram.

### Technologies Principales

- **Backend**: Node.js + Express.js
- **Frontend**: Vue.js 3 + Vite
- **Base de données**: MongoDB (production) + JSON (fallback)
- **Communication temps réel**: Socket.io (WebSocket)
- **Orchestration**: Kubernetes (Minikube)
- **Conteneurisation**: Docker
- **CI/CD**: GitHub Actions

---

## Architecture du Projet

### Structure des Microservices

```
gameV2/
├── node/
│   ├── auth-service/          # Service d'authentification (Port 3001)
│   ├── quiz-service/          # Service de gestion des questions (Port 3002)
│   ├── game-service/          # Service de jeu avec WebSocket (Port 3003)
│   └── telegram-bot/          # Bot Telegram (Port 3004)
├── vue/
│   └── front/                 # Application Vue.js frontend
├── k8s/                       # Configurations Kubernetes
└── docker-compose.yml         # Configuration Docker Compose
```

### Architecture Microservices

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vue.js)                     │
│                    Port: 5173 (dev) / 80 (prod)              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/WebSocket
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐              ┌───────────────┐
│  Nginx Proxy  │              │  Telegram Bot │
│  (K8s)        │              │  (K8s)        │
└───────┬───────┘              └───────┬───────┘
        │                               │
        │                               │
        ├───────────┬───────────┬───────┘
        │           │           │
        ▼           ▼           ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Auth    │  │  Quiz    │  │  Game    │
│ Service  │  │ Service  │  │ Service  │
│ :3001    │  │ :3002    │  │ :3003    │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┴─────────────┘
                    │
                    ▼
            ┌───────────────┐
            │   MongoDB     │
            │   :27017      │
            └───────────────┘
```

### Responsabilités des Services

#### 1. **auth-service** (Port 3001)
- **Rôle**: Gestion de l'authentification et des utilisateurs
- **Fonctionnalités**:
  - Connexion admin
  - Inscription des joueurs
  - Gestion des profils joueurs
- **Base de données**: Collection `users` dans MongoDB
- **Replicas K8s**: 2

#### 2. **quiz-service** (Port 3002)
- **Rôle**: Gestion des questions du quiz
- **Fonctionnalités**:
  - CRUD des questions
  - Récupération des questions (avec/sans réponses)
- **Base de données**: Collection `questions` dans MongoDB
- **Replicas K8s**: 2

#### 3. **game-service** (Port 3003)
- **Rôle**: Orchestration du jeu et gestion des scores
- **Fonctionnalités**:
  - Gestion de l'état du jeu (gameState)
  - Réception des réponses des joueurs
  - Calcul des scores
  - WebSocket pour les mises à jour en temps réel
  - Génération de codes de partie
- **Base de données**: 
  - Collection `gamestates` (état du jeu)
  - Collection `scores` (scores des joueurs)
- **Replicas K8s**: 2 (avec Session Affinity pour WebSocket)
- **Dépendances**: Appelle `auth-service` et `quiz-service` via HTTP

#### 4. **telegram-bot** (Port 3004)
- **Rôle**: Interface Telegram pour les joueurs
- **Fonctionnalités**:
  - Commandes `/code`, `/register`, `/status`
  - Réception des questions via WebSocket
  - Envoi des réponses
- **Dépendances**: Appelle tous les services backend

#### 5. **frontend** (Port 5173 dev / 80 prod)
- **Rôle**: Interface utilisateur web
- **Fonctionnalités**:
  - Interface admin (dashboard, gestion questions)
  - Interface joueur (inscription, quiz, classement)
  - Internationalisation (FR, EN, RU)
  - WebSocket client pour temps réel
- **Build**: Vite (production build statique)

#### 6. **nginx-proxy** (K8s)
- **Rôle**: Reverse proxy et routage
- **Fonctionnalités**:
  - Routage `/api/auth` → auth-service
  - Routage `/api/quiz` → quiz-service
  - Routage `/api/game` → game-service
  - Routage `/socket.io` → game-service (WebSocket)
  - Routage `/` → frontend
- **Type**: NodePort (port 30081)
- **Replicas**: 1

---

## API et Endpoints

### Configuration des URLs

#### En Développement
- Auth Service: `http://localhost:3001`
- Quiz Service: `http://localhost:3002`
- Game Service: `http://localhost:3003`
- WebSocket: `http://localhost:3003`

#### En Production (Kubernetes)
- Auth Service: `/api/auth` (via Nginx)
- Quiz Service: `/api/quiz` (via Nginx)
- Game Service: `/api/game` (via Nginx)
- WebSocket: `/socket.io` (via Nginx)

### Auth Service API

**Base URL**: `http://localhost:3001` (dev) ou `/api/auth` (prod)

| Méthode | Endpoint | Description | Auth | Body |
|---------|----------|-------------|------|------|
| `GET` | `/test` | Test de santé | ❌ | - |
| `POST` | `/admin/login` | Connexion admin | ❌ | `{username, password}` |
| `POST` | `/players/register` | Inscription joueur | ❌ | `{name}` |
| `GET` | `/players` | Liste tous les joueurs | ❌ | - |
| `GET` | `/players/:id` | Détails d'un joueur | ❌ | - |

**Exemples de Requêtes**:

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

**Exemples de Requêtes**:

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

**Exemples de Requêtes**:

```bash
# Démarrer le jeu (30 secondes par question)
POST /api/game/start
{
  "questionDuration": 30
}

# Soumettre une réponse
POST /api/game/answer
{
  "playerId": "player123",
  "questionId": "q1",
  "answer": "Paris"
}

# Obtenir le classement
GET /api/game/leaderboard
```

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
  socket.emit('register', { playerId: 'player123' })
})

socket.on('question:next', (data) => {
  console.log('Nouvelle question:', data.question)
})
```

### Communication Inter-Services

Le `game-service` communique avec les autres services via HTTP :

```javascript
// game-service/config/services.js
AUTH_SERVICE_URL: "http://auth-service:3001"
QUIZ_SERVICE_URL: "http://quiz-service:3002"
```

**Flux Typique**:
1. `game-service` reçoit une réponse via `/answer`
2. `game-service` appelle `auth-service` pour vérifier le joueur
3. `game-service` appelle `quiz-service` pour obtenir la question
4. `game-service` calcule le score et met à jour MongoDB
5. `game-service` émet un événement WebSocket `leaderboard:update`

---

## Déploiement Kubernetes (Minikube)

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
│   └── nginx-proxy (1 replica)
│
└── Services (ClusterIP sauf nginx-proxy: NodePort)
    ├── mongodb (ClusterIP :27017)
    ├── auth-service (ClusterIP :3001)
    ├── quiz-service (ClusterIP :3002)
    ├── game-service (ClusterIP :3003) [Session Affinity]
    ├── telegram-bot (ClusterIP :3004)
    ├── frontend (ClusterIP :80)
    └── nginx-proxy (NodePort :30081)
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
```

**Rôle**: Centralise les variables d'environnement partagées entre les services.

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

**Rôle**:
- Déploie 2 replicas pour haute disponibilité
- Utilise l'image DockerHub `thismann17/gamev2-auth-service:latest`
- `imagePullPolicy: Always` pour toujours récupérer la dernière version
- Volume `emptyDir` pour données temporaires (JSON fallback)

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

### Routage Nginx

Le Nginx proxy route les requêtes comme suit :

| Chemin Client | Route Vers | Service |
|---------------|------------|---------|
| `/` | `http://frontend:80` | Frontend |
| `/api/auth/*` | `http://auth-service:3001/auth/*` | Auth Service |
| `/api/quiz/*` | `http://quiz-service:3002/quiz/*` | Quiz Service |
| `/api/game/*` | `http://game-service:3003/game/*` | Game Service |
| `/socket.io` | `http://game-service:3003` | Game Service (WebSocket) |

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

# 4. Vérifier le statut
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

### Images Docker

Toutes les images sont poussées sur DockerHub sous le namespace `thismann17`:

- `thismann17/gamev2-auth-service:latest`
- `thismann17/gamev2-quiz-service:latest`
- `thismann17/gamev2-game-service:latest`
- `thismann17/gamev2-frontend:latest`
- `thismann17/gamev2-telegram-bot:latest`

**Build automatique**: GitHub Actions (`.github/workflows/docker-build-push.yml`)

---

## Flux de Communication

### Flux d'Inscription d'un Joueur

```
1. Joueur → Frontend: Saisit nom
2. Frontend → Auth Service: POST /api/auth/players/register
3. Auth Service → MongoDB: Créer document User
4. Auth Service → Frontend: Retourne {id, name}
5. Frontend → Game Service: WebSocket emit('register', {playerId})
6. Game Service → gameState: Ajouter playerId à connectedPlayers
7. Game Service → Frontend: WebSocket emit('players:count', {count})
```

### Flux de Démarrage d'un Jeu

```
1. Admin → Frontend: Clique "Démarrer le jeu"
2. Frontend → Game Service: POST /api/game/start {questionDuration: 30}
3. Game Service → Quiz Service: GET /quiz/full
4. Quiz Service → MongoDB: Récupérer toutes les questions
5. Quiz Service → Game Service: Retourne questions[]
6. Game Service → MongoDB: Initialiser scores pour tous les joueurs connectés
7. Game Service → gameState: Mettre isStarted=true, currentQuestionIndex=0
8. Game Service → WebSocket: Emit 'game:started' + 'question:next'
9. Tous les clients → Reçoivent la première question
```

### Flux de Réponse à une Question

```
1. Joueur → Frontend: Sélectionne une réponse
2. Frontend → Game Service: POST /api/game/answer {playerId, questionId, answer}
3. Game Service → Auth Service: GET /auth/players (vérifier joueur)
4. Game Service → Quiz Service: GET /quiz/full (obtenir question)
5. Game Service → gameState: Sauvegarder answer dans answers[playerId][questionId]
6. Game Service → Frontend: Retourne {correct, answered: true}
7. (Quand timer expire ou admin clique "Question suivante")
8. Game Service → calculateQuestionResults()
9. Game Service → MongoDB: Mettre à jour scores
10. Game Service → WebSocket: Emit 'leaderboard:update'
11. Tous les clients → Reçoivent le classement mis à jour
```

### Flux WebSocket Temps Réel

```
Client (Frontend/Telegram Bot)
    │
    ├─→ Connexion: io('http://game-service:3003')
    │
    ├─→ Émission: socket.emit('register', {playerId})
    │
    └─→ Réception:
        ├─ players:count → Mise à jour compteur
        ├─ game:started → Redirection vers quiz
        ├─ question:next → Affichage nouvelle question
        ├─ leaderboard:update → Mise à jour classement
        └─ game:ended → Affichage résultats finaux
```

---

## Base de Données

### MongoDB Collections

#### Collection: `users`

```javascript
{
  _id: ObjectId,
  id: String,           // ID unique du joueur
  name: String,         // Nom du joueur
  createdAt: Date
}
```

#### Collection: `questions`

```javascript
{
  _id: ObjectId,
  id: String,           // ID unique de la question
  question: String,     // Texte de la question
  choices: [String],    // Array de choix
  answer: String,       // Réponse correcte
  createdAt: Date
}
```

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
  gameCode: String,             // Code à 6 caractères
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

#### Collection: `scores`

```javascript
{
  _id: ObjectId,
  playerId: String,     // ID du joueur
  playerName: String,   // Nom du joueur (mis à jour dynamiquement)
  score: Number         // Score total
}
```

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

### Migration JSON → MongoDB

Les services supportent un **fallback JSON** si MongoDB n'est pas disponible :

- `node/auth-service/data/users.json`
- `node/quiz-service/data/questions.json`
- `node/game-service/data/gameState.json`
- `node/game-service/data/scores.json`

**Logique**: Si `MONGODB_URI` n'est pas défini, les services utilisent les fichiers JSON.

---

## WebSocket et Temps Réel

### Configuration Socket.io

**Côté Serveur** (`game-service/server.js`):

```javascript
const io = require('socket.io')(server, {
  path: '/socket.io',
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  serveClient: false,
  transports: ['polling', 'websocket']
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

### Gestion des Connexions

1. **Connexion Initiale**: Client se connecte via polling
2. **Upgrade WebSocket**: Si supporté, upgrade automatique vers WebSocket
3. **Reconnexion**: Automatique en cas de déconnexion
4. **Session Affinity**: K8s garantit que le même pod gère la connexion

### Événements Critiques

#### `register` (Client → Serveur)

```javascript
socket.emit('register', { playerId: 'player123' })
```

**Action Serveur**:
- Ajoute `playerId` à `gameState.connectedPlayers`
- Émet `players:count` à tous les clients
- Si jeu déjà démarré, envoie la question actuelle

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

### Clés de Traduction

Structure: `[component].[key]`

Exemples:
- `admin.dashboard.title`
- `quiz.waiting`
- `register.enterCode`
- `leaderboard.title`

---

## Conclusion

Cette documentation couvre l'architecture complète d'IntelectGame V2, incluant :

✅ **Architecture microservices** avec 4 services backend + frontend  
✅ **API REST complète** avec tous les endpoints  
✅ **Déploiement Kubernetes** détaillé avec Minikube  
✅ **WebSocket temps réel** pour les mises à jour  
✅ **Base de données MongoDB** avec schémas  
✅ **Internationalisation** multi-langues  

Pour les améliorations et le workflow de test/déploiement, voir **AMELIORATION_ARCHITECTURE.md**.


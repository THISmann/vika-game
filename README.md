# IntelectGame V2

Jeu de questions-réponses en temps réel avec Vue.js et Node.js.

## 🎮 Description

IntelectGame est une application de quiz en temps réel où :
- **Administrateurs** peuvent ajouter, modifier et supprimer des questions
- **Joueurs** peuvent s'inscrire et répondre aux questions
- Plusieurs joueurs peuvent répondre simultanément
- L'administrateur peut voir le classement en temps réel
- Les scores sont mis à jour en temps réel via WebSocket

## 🏗️ Architecture

L'application utilise une architecture microservices :

### Services Backend (Node.js)

1. **auth-service** (Port 3001)
   - Authentification admin
   - Inscription et gestion des joueurs
   - Stockage : MongoDB + JSON (fallback)

2. **quiz-service** (Port 3002)
   - Gestion des questions (CRUD)
   - Stockage : MongoDB + JSON (fallback)

3. **game-service** (Port 3003)
   - Gestion des réponses
   - Calcul des scores
   - WebSocket pour les mises à jour en temps réel
   - Stockage : MongoDB + JSON (fallback)

### Frontend (Vue.js)

- Interface utilisateur moderne
- Composants séparés pour admin et joueurs
- Connexion WebSocket pour les mises à jour en temps réel

### Base de données

- **MongoDB** : Base de données principale
- **Fichiers JSON** : Fallback et développement local

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- MongoDB (optionnel, JSON utilisé par défaut)
- Docker et Docker Compose (pour le déploiement)

### Installation

1. Cloner le repository

2. Installer les dépendances :

```bash
# Backend services
cd node/auth-service && npm install
cd ../quiz-service && npm install
cd ../game-service && npm install

# Frontend
cd ../../vue/front && npm install
```

### Développement local

#### Démarrer les services backend

```bash
# Terminal 1 - Auth Service
cd node/auth-service
npm start

# Terminal 2 - Quiz Service
cd node/quiz-service
npm start

# Terminal 3 - Game Service
cd node/game-service
npm start
```

#### Démarrer le frontend

```bash
cd vue/front
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Déploiement avec Docker Compose

**Option 1 : Utiliser le script (recommandé)**
```bash
./docker-compose.up.sh
```

**Option 2 : Désactiver BuildKit manuellement**
```bash
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose up -d --build
```

**Option 3 : Build classique (si BuildKit cause des problèmes)**
```bash
docker compose build --no-cache
docker compose up -d
```

Les services seront accessibles sur :
- Frontend : http://localhost:5173
- Auth Service : http://localhost:3001
- Quiz Service : http://localhost:3002
- Game Service : http://localhost:3003

### Déploiement sur Kubernetes (Minikube)

Voir le fichier [k8s/README.md](./k8s/README.md) pour les instructions détaillées.

#### Déploiement rapide

```bash
# Rendre le script exécutable
chmod +x k8s/build-and-deploy.sh

# Exécuter le script
./k8s/build-and-deploy.sh
```

## 📁 Structure du projet

```
gameV2/
├── node/
│   ├── auth-service/      # Service d'authentification
│   ├── quiz-service/       # Service de gestion des questions
│   └── game-service/       # Service de jeu avec WebSocket
├── vue/
│   └── front/              # Application Vue.js
├── k8s/                    # Fichiers Kubernetes
│   ├── mongodb-deployment.yaml
│   ├── auth-service-deployment.yaml
│   ├── quiz-service-deployment.yaml
│   ├── game-service-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── configmap.yaml
│   ├── all-services.yaml
│   └── README.md
├── docker-compose.yml
└── README.md
```

## 🔐 Authentification

### Admin
- Username : `admin`
- Password : `admin`

### Joueurs
Les joueurs s'inscrivent avec un nom unique lors de leur première connexion.

## 📡 API Endpoints

### Auth Service (http://localhost:3001)

- `POST /auth/admin/login` - Connexion admin
- `POST /auth/players/register` - Inscription joueur
- `GET /auth/players` - Liste des joueurs
- `GET /auth/players/:id` - Détails d'un joueur

### Quiz Service (http://localhost:3002)

- `GET /quiz/all` - Liste des questions (sans réponses)
- `GET /quiz/full` - Liste complète des questions
- `POST /quiz/create` - Créer une question (admin)
- `PUT /quiz/:id` - Modifier une question (admin)
- `DELETE /quiz/:id` - Supprimer une question (admin)

### Game Service (http://localhost:3003)

- `POST /game/answer` - Soumettre une réponse
- `GET /game/score/:playerId` - Score d'un joueur
- `GET /game/leaderboard` - Classement

### WebSocket (game-service)

- `register` - Enregistrer un joueur pour les mises à jour
- `score:update` - Mise à jour du score d'un joueur
- `leaderboard:update` - Mise à jour du classement

## 🛠️ Technologies utilisées

### Backend
- Node.js
- Express.js
- Socket.io (WebSocket)
- MongoDB / Mongoose
- JSON (fallback)

### Frontend
- Vue.js 3
- Vue Router
- Axios
- Socket.io Client

### Infrastructure
- Docker
- Docker Compose
- Kubernetes
- Minikube

## 📝 Notes de développement

- Les données sont stockées dans des fichiers JSON par défaut
- MongoDB peut être activé en configurant la variable d'environnement `MONGODB_URI`
- Les services communiquent entre eux via HTTP
- Le game-service utilise WebSocket pour les mises à jour en temps réel

## 🐛 Dépannage

### Les services ne démarrent pas
- Vérifier que les ports 3001, 3002, 3003 ne sont pas déjà utilisés
- Vérifier que les fichiers JSON de données existent dans les dossiers `data/`

### Problèmes de connexion WebSocket
- Vérifier que le game-service est démarré
- Vérifier la configuration CORS

### Problèmes MongoDB
- Vérifier que MongoDB est démarré
- Vérifier la variable d'environnement `MONGODB_URI`

## 📄 Licence

ISC

## 👤 Auteur

Etienne


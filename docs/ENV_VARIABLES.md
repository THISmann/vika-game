# Variables d'Environnement

## 📋 Liste Complète

### Services Node.js

#### Auth Service
- `NODE_ENV` - `production` ou `development` (défaut: `development`)
- `PORT` - Port du service (défaut: `3001`)
- `MONGODB_URI` - URI de connexion MongoDB (défaut: `mongodb://mongodb:27017/intelectgame`)
- `REDIS_HOST` - Host Redis (défaut: `redis`)
- `REDIS_PORT` - Port Redis (défaut: `6379`)

#### Quiz Service
- `NODE_ENV` - `production` ou `development` (défaut: `development`)
- `PORT` - Port du service (défaut: `3002`)
- `MONGODB_URI` - URI de connexion MongoDB (défaut: `mongodb://mongodb:27017/intelectgame`)
- `AUTH_SERVICE_URL` - URL du service d'authentification (défaut: `http://auth:3001`)
- `REDIS_HOST` - Host Redis (défaut: `redis`)
- `REDIS_PORT` - Port Redis (défaut: `6379`)

#### Game Service
- `NODE_ENV` - `production` ou `development` (défaut: `development`)
- `PORT` - Port du service (défaut: `3003`)
- `MONGODB_URI` - URI de connexion MongoDB (défaut: `mongodb://mongodb:27017/intelectgame`)
- `AUTH_SERVICE_URL` - URL du service d'authentification (défaut: `http://auth:3001`)
- `QUIZ_SERVICE_URL` - URL du service de quiz (défaut: `http://quiz:3002`)
- `REDIS_HOST` - Host Redis (défaut: `redis`)
- `REDIS_PORT` - Port Redis (défaut: `6379`)
- `MINIO_ENDPOINT` - Endpoint MinIO (défaut: `minio`)
- `MINIO_PORT` - Port MinIO (défaut: `9000`)
- `MINIO_ACCESS_KEY` - Clé d'accès MinIO (défaut: `minioadmin`)
- `MINIO_SECRET_KEY` - Clé secrète MinIO (défaut: `minioadmin`)
- `MINIO_BUCKET_NAME` - Nom du bucket (défaut: `game-files`)

#### API Gateway
- `NODE_ENV` - `production` ou `development` (défaut: `development`)
- `PORT` - Port du service (défaut: `3000`)
- `AUTH_SERVICE_URL` - URL du service d'authentification (défaut: `http://auth:3001`)
- `QUIZ_SERVICE_URL` - URL du service de quiz (défaut: `http://quiz:3002`)
- `GAME_SERVICE_URL` - URL du service de jeu (défaut: `http://game:3003`)
- `TELEGRAM_SERVICE_URL` - URL du service Telegram (défaut: `http://telegram-bot:3004`)

#### Telegram Bot
- `NODE_ENV` - `production` ou `development` (défaut: `development`)
- `PORT` - Port du service (défaut: `3004`)
- `TELEGRAM_BOT_TOKEN` - **REQUIRED** - Token du bot Telegram
- `MONGODB_URI` - URI de connexion MongoDB (défaut: `mongodb://mongodb:27017/intelectgame`)
- `AUTH_SERVICE_URL` - URL du service d'authentification (défaut: `http://auth:3001`)
- `QUIZ_SERVICE_URL` - URL du service de quiz (défaut: `http://quiz:3002`)
- `GAME_SERVICE_URL` - URL du service de jeu (défaut: `http://game:3003`)
- `GAME_WS_URL` - URL WebSocket du service de jeu (défaut: `http://game:3003`)

### Frontend (Vite)

#### Frontend (User)
- `VITE_AUTH_SERVICE_URL` - URL du service d'authentification (production: `/vika-game/api`)
- `VITE_QUIZ_SERVICE_URL` - URL du service de quiz (production: `/vika-game/api`)
- `VITE_GAME_SERVICE_URL` - URL du service de jeu (production: `/vika-game/api`)
- `VITE_BASE_URL` - Base URL pour le routing (défaut: `/vika-game/`)

#### Admin Frontend
- `VITE_AUTH_SERVICE_URL` - URL du service d'authentification (production: `/vika-game/api`)
- `VITE_QUIZ_SERVICE_URL` - URL du service de quiz (production: `/vika-game/api`)
- `VITE_GAME_SERVICE_URL` - URL du service de jeu (production: `/vika-game/api`)
- `VITE_BASE_URL` - Base URL pour le routing (défaut: `/vika-admin/`)

## 🔧 Configuration Production

### Docker Compose
Toutes les variables sont définies dans `docker-compose.yml` pour chaque service.

### Kubernetes
Les variables doivent être définies dans :
- ConfigMaps pour les valeurs non sensibles
- Secrets pour les valeurs sensibles (tokens, passwords, clés)

### Exemple de fichier .env (local development)
```bash
# Node Environment
NODE_ENV=development

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
QUIZ_SERVICE_URL=http://localhost:3002
GAME_SERVICE_URL=http://localhost:3003
TELEGRAM_SERVICE_URL=http://localhost:3004

# Database
MONGODB_URI=mongodb://localhost:27017/intelectgame

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=game-files

# Telegram Bot (REQUIRED)
TELEGRAM_BOT_TOKEN=your_token_here
```

## ⚠️ Important

- **Ne jamais commiter** de fichiers `.env` avec des valeurs réelles
- En production, utiliser des secrets Kubernetes ou Docker secrets
- Toutes les variables ont des valeurs par défaut pour éviter les erreurs
- `TELEGRAM_BOT_TOKEN` est **REQUIRED** pour le service Telegram Bot

---

**Date**: $(date)


# Guide Docker Compose - Test Local

Ce guide explique comment tester l'application complète avec Docker Compose en local.

## 📋 Prérequis

- Docker et Docker Compose installés
- Un token Telegram Bot (optionnel, pour tester le bot)

## 🚀 Démarrage Rapide

### 1. Configuration du Token Telegram (Optionnel)

Si vous voulez tester le bot Telegram, créez un fichier `.env` dans `node/telegram-bot/` :

```bash
# Créer le fichier .env pour le telegram-bot
cat > node/telegram-bot/.env << EOF
TELEGRAM_BOT_TOKEN=votre_token_ici
AUTH_SERVICE_URL=http://auth:3001
QUIZ_SERVICE_URL=http://quiz:3002
GAME_SERVICE_URL=http://game:3003
GAME_WS_URL=http://game:3003
EOF
```

**OU** définissez la variable d'environnement avant de lancer Docker Compose :

```bash
export TELEGRAM_BOT_TOKEN="votre_token_ici"
```

### 2. Démarrer tous les services

```bash
# Construire et démarrer tous les services
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build
```

### 3. Vérifier que tous les services sont actifs

```bash
# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f api-gateway
docker-compose logs -f telegram-bot
```

### 4. Tester les endpoints

```bash
# Health check de l'API Gateway
curl http://localhost:3000/health

# Test du game-service via API Gateway
curl http://localhost:3000/game/code

# Test du quiz-service via API Gateway
curl http://localhost:3000/quiz/all

# Test de l'auth-service via API Gateway
curl http://localhost:3000/auth/test
```

### 5. Accéder au frontend

Ouvrez votre navigateur à : **http://localhost:5173**

## 🔧 Configuration des Services

### Ports exposés

- **API Gateway** : `3000`
- **Auth Service** : `3001`
- **Quiz Service** : `3002`
- **Game Service** : `3003`
- **Telegram Bot** : `3004`
- **Frontend** : `5173`
- **MongoDB** : `27017`

### Variables d'environnement

Le `docker-compose.yml` configure automatiquement :
- MongoDB URI pour tous les services
- URLs des services entre eux (via les noms de conteneurs Docker)
- API Gateway comme point d'entrée unique

## 🧪 Tests avec le Script Automatisé

Un script de test est disponible :

```bash
# Tester tous les endpoints via l'API Gateway
./scripts/test-api-gateway.sh

# Tester les services directement
./scripts/test-local-services.sh
```

## 🐛 Dépannage

### Le telegram-bot ne démarre pas

**Erreur** : `❌ TELEGRAM_BOT_TOKEN is required!`

**Solution** :
1. Créez le fichier `node/telegram-bot/.env` avec votre token
2. OU définissez `export TELEGRAM_BOT_TOKEN="votre_token"`
3. Redémarrez : `docker-compose restart telegram-bot`

### Les services ne peuvent pas se connecter

**Vérifiez** :
```bash
# Vérifier que tous les conteneurs sont en cours d'exécution
docker-compose ps

# Vérifier les logs d'erreur
docker-compose logs | grep -i error

# Vérifier la connectivité réseau
docker-compose exec api-gateway ping auth
docker-compose exec api-gateway ping game
```

### MongoDB ne démarre pas

**Vérifiez** :
```bash
# Voir les logs MongoDB
docker-compose logs mongodb

# Vérifier le volume
docker volume ls | grep mongodb

# Redémarrer MongoDB
docker-compose restart mongodb
```

### Le frontend ne peut pas accéder aux APIs

**Vérifiez** :
1. L'API Gateway est actif : `curl http://localhost:3000/health`
2. Les variables `VITE_*` sont correctement configurées dans `docker-compose.yml`
3. Le frontend a été reconstruit : `docker-compose build frontend`

## 📝 Commandes Utiles

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données MongoDB)
docker-compose down -v

# Reconstruire un service spécifique
docker-compose build api-gateway
docker-compose up -d api-gateway

# Voir les logs en temps réel
docker-compose logs -f api-gateway telegram-bot

# Exécuter une commande dans un conteneur
docker-compose exec api-gateway sh
docker-compose exec mongodb mongosh

# Redémarrer un service
docker-compose restart telegram-bot
```

## 🔐 Sécurité

⚠️ **Important** : Ne commitez jamais le fichier `.env` contenant le token Telegram dans Git !

Le fichier `node/telegram-bot/.env` devrait être dans `.gitignore` :

```gitignore
# Telegram Bot
node/telegram-bot/.env
```

## 📚 Prochaines Étapes

Une fois que tout fonctionne en local :
1. Testez le frontend : http://localhost:5173
2. Testez le bot Telegram (si configuré)
3. Vérifiez les logs pour détecter d'éventuels problèmes
4. Passez aux tests d'intégration


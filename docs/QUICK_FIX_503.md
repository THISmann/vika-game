# ⚡ Solution Rapide : Erreur 503

## 🐛 Problème

Vous voyez l'erreur `503 (Service Unavailable)` sur `http://localhost:3000/game/*` car :
- L'API Gateway (port 3000) est actif
- Mais le **game-service** (port 3003) n'est **pas démarré**

## ✅ Solution Immédiate

### Option 1 : Démarrer le Game Service

```bash
# Terminal 1 : Démarrer le game-service
cd node/game-service
npm start
```

Le service devrait démarrer et vous devriez voir :
```
Game service running on port 3003
```

### Option 2 : Démarrer Tous les Services

```bash
# Utiliser le script automatique
./scripts/start-all-services.sh
```

Ou manuellement :

```bash
# Terminal 1 : Auth Service
cd node/auth-service && npm start

# Terminal 2 : Quiz Service  
cd node/quiz-service && npm start

# Terminal 3 : Game Service
cd node/game-service && npm start
```

### Option 3 : Utiliser Docker Compose

```bash
# Démarrer tous les services
docker-compose up
```

## 🔍 Vérification

Après avoir démarré le service, testez :

```bash
# Test direct du game-service
curl http://localhost:3003/game/test

# Devrait retourner : {"message":"Auth route working well now!"}
```

## 📋 Checklist

- [ ] Game Service démarré sur le port 3003
- [ ] Le service répond sur `http://localhost:3003/game/test`
- [ ] L'API Gateway peut maintenant router les requêtes

## 💡 Note

Si vous n'utilisez pas l'API Gateway en développement, vous pouvez configurer le frontend pour pointer directement vers les services :

1. Créer `vue/front/.env` :
```env
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_QUIZ_SERVICE_URL=http://localhost:3002
VITE_GAME_SERVICE_URL=http://localhost:3003
```

2. Redémarrer le serveur de développement :
```bash
cd vue/front
npm run dev
```

Cela évitera d'avoir besoin de l'API Gateway en développement.


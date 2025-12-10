# 🔧 Résolution de l'Erreur 503 (Service Unavailable)

## 🐛 Problème

L'erreur `503 (Service Unavailable)` sur `http://localhost:3000/game/*` indique que :
- L'API Gateway (port 3000) est actif
- Mais le game-service (port 3003) n'est pas démarré ou n'est pas accessible

## ✅ Solutions

### Solution 1 : Démarrer le Game Service (Recommandé)

```bash
# Terminal 1 : Démarrer le game-service
cd node/game-service
npm start

# Le service devrait démarrer sur le port 3003
# Vous devriez voir : "Game service running on port 3003"
```

### Solution 2 : Démarrer Tous les Services

```bash
# Terminal 1 : Auth Service
cd node/auth-service
npm start

# Terminal 2 : Quiz Service
cd node/quiz-service
npm start

# Terminal 3 : Game Service
cd node/game-service
npm start
```

### Solution 3 : Utiliser Docker Compose

```bash
# Démarrer tous les services avec Docker Compose
docker-compose up

# Ou seulement les services backend
docker-compose up auth quiz game
```

### Solution 4 : Désactiver l'API Gateway (Développement)

Si vous n'utilisez pas l'API Gateway en développement, modifiez la configuration :

1. **Créer un fichier `.env` dans `vue/front/`** :
```env
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_QUIZ_SERVICE_URL=http://localhost:3002
VITE_GAME_SERVICE_URL=http://localhost:3003
```

2. **Redémarrer le serveur de développement** :
```bash
cd vue/front
npm run dev
```

## 🔍 Vérification

### Vérifier que les services sont démarrés

```bash
# Vérifier les ports
lsof -i :3001  # Auth Service
lsof -i :3002  # Quiz Service
lsof -i :3003  # Game Service
lsof -i :3000  # API Gateway
```

### Tester les endpoints directement

```bash
# Test Auth Service
curl http://localhost:3001/auth/test

# Test Quiz Service
curl http://localhost:3002/quiz/test

# Test Game Service
curl http://localhost:3003/game/test

# Test API Gateway
curl http://localhost:3000/game/state
```

## 📋 Checklist

- [ ] Game Service démarré sur le port 3003
- [ ] Auth Service démarré sur le port 3001
- [ ] Quiz Service démarré sur le port 3002
- [ ] API Gateway démarré sur le port 3000 (si utilisé)
- [ ] Les services peuvent communiquer entre eux
- [ ] MongoDB est démarré (si utilisé)
- [ ] Redis est démarré (si utilisé)

## 🚨 Erreurs Courantes

### "Cannot connect to game-service"

**Cause** : Le game-service n'est pas démarré

**Solution** :
```bash
cd node/game-service
npm install  # Si les dépendances ne sont pas installées
npm start
```

### "Connection refused"

**Cause** : Le port est déjà utilisé ou le service n'écoute pas

**Solution** :
```bash
# Vérifier quel processus utilise le port
lsof -i :3003

# Tuer le processus si nécessaire
kill -9 <PID>

# Redémarrer le service
cd node/game-service
npm start
```

### "Service Unavailable" depuis l'API Gateway

**Cause** : L'API Gateway ne peut pas joindre le service backend

**Solution** :
1. Vérifier que le service backend est démarré
2. Vérifier la configuration de l'API Gateway
3. Vérifier les variables d'environnement

## 🔄 Configuration de l'API Gateway

Si vous utilisez l'API Gateway, vérifiez la configuration dans `k8s/nginx-proxy-config.yaml` :

```yaml
location /game/ {
    proxy_pass http://game-service:3003/game/;
    # ...
}
```

Assurez-vous que :
- Le service `game-service` est accessible depuis l'API Gateway
- Le port 3003 est correct
- Les headers sont correctement transmis

## 💡 Astuce

Pour le développement local, il est souvent plus simple de :
1. Démarrer les services directement (sans API Gateway)
2. Configurer le frontend pour pointer directement vers les services
3. Utiliser l'API Gateway uniquement en production


# 🔧 Correction : Module Not Found dans Docker

## 🐛 Problème

Erreur lors du démarrage du game-service dans Docker :
```
Error: Cannot find module '../../shared/middleware/auth.middleware'
```

## ✅ Solution Appliquée

Le code a été modifié pour essayer plusieurs chemins :

1. **Chemin Docker** : `../shared/middleware/auth.middleware` (depuis `/app/routes/`)
2. **Chemin développement local** : `../../shared/middleware/auth.middleware` (depuis `node/game-service/routes/`)
3. **Fallback** : Middleware basique si aucun n'est trouvé

## 📋 Structure dans Docker

Dans le conteneur Docker :
```
/app/
  ├── routes/
  │   └── game.routes.js
  ├── shared/
  │   └── middleware/
  │       └── auth.middleware.js
  └── server.js
```

Le chemin depuis `/app/routes/game.routes.js` vers `/app/shared/middleware/auth.middleware.js` est : `../shared/middleware/auth.middleware`

## 🔍 Vérification

### Vérifier que le dossier existe

```bash
# Dans le conteneur Docker
docker exec intelectgame-game ls -la /app/shared/middleware/

# Devrait afficher :
# auth.middleware.js
```

### Vérifier le build Docker

```bash
# Reconstruire l'image
docker-compose build game

# Vérifier que shared est copié
docker-compose run --rm game ls -la /app/shared/
```

## 🚀 Rebuild

Si le problème persiste, reconstruisez l'image :

```bash
# Reconstruire uniquement le game-service
docker-compose build game

# Redémarrer
docker-compose up game
```

Ou reconstruire tous les services :

```bash
docker-compose build
docker-compose up
```

## 📝 Note

Le Dockerfile copie `shared` depuis le contexte `./node` :
```dockerfile
COPY shared ./shared
```

Cela copie `node/shared` vers `/app/shared` dans le conteneur.


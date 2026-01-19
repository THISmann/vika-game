# 🔧 Fix Socket.IO 404 Error - Production Server

## ❌ Problème

Erreur Socket.IO 404 en production :
```
GET http://82.202.141.248/socket.io/?EIO=4&transport=polling&t=8uk9aha1 404 (Not Found)
```

## 🔍 Cause

Le frontend en production essaie de se connecter à `/socket.io/` mais Traefik ne route pas ce chemin vers le game-service. Socket.IO doit être accessible via Traefik pour fonctionner en production.

## ✅ Solution

Ajouter des labels Traefik au service `game` dans `docker-compose.yml` pour router `/socket.io` vers `game-service:3003` :

```yaml
game:
  # ... autres configurations ...
  labels:
    - "traefik.enable=true"
    # Route Socket.IO vers game-service
    - "traefik.http.routers.socket-io.rule=PathPrefix(`/socket.io`)"
    - "traefik.http.routers.socket-io.entrypoints=web"
    - "traefik.http.services.socket-io.loadbalancer.server.port=3003"
    - "traefik.http.routers.socket-io.priority=20"
```

## 📝 Modifications

Dans `docker-compose.yml`, la section `game` a été modifiée pour inclure les labels Traefik.

## ⚠️ Note sur l'erreur Docker Compose

Le problème `KeyError: 'ContainerConfig'` empêche docker-compose de recréer le container game. 

**Solution temporaire** : Créer le container game manuellement avec `docker run` incluant les labels Traefik, ou redémarrer tous les services avec `docker-compose down` puis `docker-compose up -d`.

## 🔄 Après le fix

Vérifier que :
1. Le container game est démarré : `docker ps | grep game`
2. Les labels Traefik sont appliqués : `docker inspect intelectgame-game | grep -i traefik`
3. Socket.IO est accessible : `curl http://82.202.141.248/socket.io/` (ne devrait plus retourner 404)

---

**Date**: $(date)
**Serveur**: user1@82.202.141.248
**Status**: En cours de résolution


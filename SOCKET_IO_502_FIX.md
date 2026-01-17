# 🔧 Fix Socket.IO 502 Bad Gateway - Solution

## ❌ Problème

Socket.IO via Traefik retourne **502 Bad Gateway** de manière intermittente :
- ✅ Parfois fonctionne (quand Traefik utilise l'IP correcte `172.19.0.12`)
- ❌ Parfois échoue (quand Traefik utilise d'autres IPs comme `172.19.0.6`, `172.19.0.4`, etc.)

### Cause

Le service `socket-io@docker` dans Traefik inclut **plusieurs IPs** (9 différentes) au lieu d'utiliser uniquement le container `game` (IP `172.19.0.12`). Traefik charge balance entre toutes ces IPs, mais seulement une d'entre elles est le vrai container `game`.

## ✅ Solutions appliquées

### 1. Configuration explicite dans docker-compose.yml

Ajout de labels Traefik plus spécifiques :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.socket-io.rule=PathPrefix(`/socket.io`)"
  - "traefik.http.routers.socket-io.entrypoints=web"
  - "traefik.http.routers.socket-io.service=socket-io"
  - "traefik.http.services.socket-io.loadbalancer.server.port=3003"
  - "traefik.http.services.socket-io.loadbalancer.server.scheme=http"
  - "traefik.http.routers.socket-io.priority=20"
  - "traefik.docker.network=user1_app-network"
  - "traefik.http.routers.socket-io.tls=false"
```

### 2. Nettoyage des containers

Recréation des containers `game` et `traefik` pour forcer Traefik à redécouvrir les services :

```bash
docker stop intelectgame-game intelectgame-traefik
docker rm intelectgame-game intelectgame-traefik
docker-compose up -d --no-deps game traefik
```

## 📝 Tests

Après les corrections, tester Socket.IO plusieurs fois :

```bash
# Tester Socket.IO via Traefik
for i in 1 2 3 4 5; do
  curl -s 'http://82.202.141.248/socket.io/?EIO=4&transport=polling' | head -1
  sleep 2
done
```

**Résultat attendu** : Tous les tests devraient retourner du JSON Socket.IO (comme `0{"sid":"..."}`) au lieu de "Bad Gateway".

## 🔍 Vérification

1. **Vérifier le service Traefik** :
   ```bash
   curl -s http://localhost:8080/api/http/services/socket-io@docker
   ```
   Le service devrait pointer uniquement vers le container `game` (IP `172.19.0.12`).

2. **Vérifier les logs Traefik** :
   ```bash
   docker logs intelectgame-traefik --tail=50 | grep socket
   ```
   Les requêtes réussies devraient montrer `"http://172.19.0.12:3003"`.

3. **Tester Socket.IO** :
   ```bash
   curl -I http://82.202.141.248/socket.io/
   ```
   Devrait retourner `200 OK` ou `HTTP/1.1 200` au lieu de `502 Bad Gateway`.

## ⚠️ Note

Si le problème persiste, cela peut indiquer que :
1. Traefik détecte d'autres containers avec le port 3003
2. Il y a un problème de réseau Docker entre Traefik et le game-service
3. Le game-service n'est pas complètement prêt quand Traefik essaie de se connecter

Dans ce cas, vérifier :
- Que seul le container `game` expose le port 3003 : `docker ps | grep 3003`
- Que le game-service est sain : `docker logs intelectgame-game --tail=20`
- Que Traefik peut accéder au game-service : `docker exec intelectgame-traefik wget -q -O- http://game:3003/socket.io/?EIO=4&transport=polling`

---

**Date**: $(date)
**Serveur**: user1@82.202.141.248
**Status**: ⚠️ En cours de résolution (problème intermittent)


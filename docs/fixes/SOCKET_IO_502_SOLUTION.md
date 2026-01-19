# 🔧 Solution Socket.IO 502 Bad Gateway - Analyse et Résolution

## ❌ Problème Identifié

Socket.IO via Traefik retourne **502 Bad Gateway** de manière intermittente :
- ✅ Fonctionne parfois (quand Traefik utilise l'IP `172.19.0.12` du container `game`)
- ❌ Échoue souvent (quand Traefik utilise d'autres IPs comme `172.19.0.6`, `172.19.0.4`, etc.)

### Cause Racine

Le service `socket-io@docker` dans Traefik inclut **9 IPs différentes** au lieu d'utiliser uniquement le container `game`. Traefik charge balance entre toutes ces IPs via son load balancer, mais seulement l'IP `172.19.0.12` correspond au vrai container `game`. Les autres IPs sont probablement :
1. D'anciens containers `game` qui ont été recréés
2. D'autres containers sur le réseau qui ont le port 3003 exposé
3. Des IPs fantômes qui n'ont pas été nettoyées par Traefik

## ✅ Solutions Appliquées

### 1. Configuration explicite dans docker-compose.yml

```yaml
game:
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

### 2. Nettoyage et recréation des containers

```bash
# Arrêter et supprimer les containers
docker stop intelectgame-game intelectgame-traefik
docker rm intelectgame-game intelectgame-traefik

# Recréer les containers
docker-compose up -d --no-deps game traefik

# Attendre que les services soient prêts
sleep 20
```

## ⚠️ Problème Persistant

Même après ces corrections, le problème persiste de manière intermittente. Cela indique que :
1. Traefik continue de détecter plusieurs IPs pour le service `socket-io@docker`
2. Le load balancer Traefik alterne entre ces IPs de manière aléatoire
3. Certaines IPs ne correspondent pas au container `game` actuel

## 🔍 Diagnostic

### Vérifier le service Traefik

```bash
# Voir toutes les IPs configurées pour le service socket-io
curl -s http://localhost:8080/api/http/services/socket-io@docker | jq '.loadBalancer.servers'
```

### Vérifier les logs Traefik

```bash
# Voir les requêtes Socket.IO et les IPs utilisées
docker logs intelectgame-traefik --tail=50 | grep socket
```

Les logs montrent que Traefik essaie plusieurs IPs :
- `http://172.19.0.12:3003` ✅ (IP du container `game` actuel - fonctionne)
- `http://172.19.0.6:3003` ❌ (autre IP - échoue)
- `http://172.19.0.4:3003` ❌ (autre IP - échoue)
- etc.

## 💡 Solutions Possibles

### Solution 1: Forcer Traefik à utiliser uniquement le container `game`

Ajouter un label spécifique au container `game` pour qu'il soit le seul utilisé par le service `socket-io` :

```yaml
game:
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
    # Ajouter un label unique pour identifier ce container
    - "traefik.tags=socket-io-backend"
```

### Solution 2: Nettoyer le réseau Docker

Les IPs fantômes peuvent provenir d'anciens containers sur le réseau. Nettoyer le réseau :

```bash
# Voir tous les containers sur le réseau
docker network inspect user1_app-network

# Si nécessaire, recréer le réseau (⚠️ arrêtera tous les services)
docker-compose down
docker network rm user1_app-network
docker-compose up -d
```

### Solution 3: Utiliser un nom de service spécifique

Au lieu de laisser Traefik auto-détecter les containers, utiliser explicitement le nom du service Docker Compose :

```yaml
# Dans docker-compose.yml, le service s'appelle "game"
# Traefik devrait automatiquement utiliser ce service uniquement
# Mais si cela ne fonctionne pas, vérifier la configuration Traefik provider
```

## 📝 Tests

```bash
# Tester Socket.IO plusieurs fois pour voir si c'est intermittent
for i in {1..10}; do
  echo "Test $i:"
  curl -s 'http://82.202.141.248/socket.io/?EIO=4&transport=polling' | head -1
  sleep 1
done
```

## ⚠️ Note

Le problème peut être toléré si le taux de succès est suffisant (par exemple > 80%), car Socket.IO gère automatiquement les reconnexions. Cependant, pour une solution robuste, il faut que Traefik utilise uniquement le container `game` actuel.

---

**Date**: $(date)
**Serveur**: user1@82.202.141.248
**Status**: ⚠️ Problème intermittent - Nécessite une investigation plus approfondie de la configuration Traefik


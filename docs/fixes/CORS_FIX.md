# 🔧 Fix CORS Error - Production Frontend

## ❌ Problème

Erreur CORS en production :
```
Access to XMLHttpRequest at 'http://localhost:3003/game/players' from origin 'http://82.202.141.248' has been blocked by CORS policy: The request client is not a secure context and the resource is in more-private address space `loopback`.
```

## 🔍 Cause

Le frontend en production utilisait `http://localhost:3001/3002/3003` dans les variables d'environnement `VITE_*`. En production :
- Le frontend tourne dans le navigateur de l'utilisateur (pas dans le container Docker)
- Le navigateur ne peut pas accéder à `localhost:3003` depuis `http://82.202.141.248`
- Les navigateurs bloquent les requêtes HTTP vers des adresses loopback (`localhost`, `127.0.0.1`) depuis un contexte non sécurisé (HTTP non localhost)

## ✅ Solution

Utiliser des URLs relatives `/vika-game/api` au lieu de `http://localhost:3001` pour que :
- Les requêtes passent par le même domaine (pas de problème CORS)
- Traefik/API Gateway route les requêtes vers les bons services
- Ça fonctionne à la fois en local (via proxy Vite) et en production

## 📝 Modifications

Dans `docker-compose.yml` :

### Avant
```yaml
environment:
  - VITE_AUTH_SERVICE_URL=http://localhost:3001
  - VITE_QUIZ_SERVICE_URL=http://localhost:3002
  - VITE_GAME_SERVICE_URL=http://localhost:3003
```

### Après
```yaml
environment:
  # Use relative URLs for production (via Traefik/API Gateway)
  # In production, the browser accesses services through the same domain
  - VITE_AUTH_SERVICE_URL=/vika-game/api
  - VITE_QUIZ_SERVICE_URL=/vika-game/api
  - VITE_GAME_SERVICE_URL=/vika-game/api
```

## 🔄 Déploiement

1. ✅ Commit des modifications locales
2. ✅ Push vers le serveur (via `git pull` sur le serveur)
3. ⚠️ Rebuild des containers frontend (problème `KeyError: 'ContainerConfig'` avec docker-compose)

## ⚠️ Problème Docker Compose

L'erreur `KeyError: 'ContainerConfig'` lors du rebuild avec `docker-compose up --build` est un bug connu de docker-compose.

**Solution alternative** :
- Utiliser `docker-compose down` puis `docker-compose up` pour tout recréer
- Ou utiliser directement `docker run` avec les nouvelles variables d'environnement

## ✅ Vérification

- Les variables d'environnement doivent être `/vika-game/api` (URLs relatives)
- Les requêtes API doivent passer par Traefik/API Gateway (`http://82.202.141.248/vika-game/api/...`)
- Plus d'erreurs CORS dans la console du navigateur


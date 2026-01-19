# Vérification du Déploiement Serveur

Ce document décrit comment vérifier que toutes les modifications sont correctement déployées sur le serveur en ligne.

## 🔄 Synchronisation Git

### 1. Push des modifications locales

Depuis votre machine locale :

```bash
cd ~/Documents/GitHub/gameV2
git push origin main
```

### 2. Pull sur le serveur

Connectez-vous au serveur et récupérez les modifications :

```bash
ssh user1@82.202.141.248
cd ~/vika-game
git pull origin main
```

## 🚀 Déploiement

### Redémarrer les services

```bash
cd ~/vika-game
docker-compose down
docker-compose up -d --build
```

### Vérifier l'état des conteneurs

```bash
docker-compose ps
```

Tous les conteneurs doivent être en état "Up".

## ✅ Script de Vérification Automatique

Un script de vérification complet est disponible :

```bash
cd ~/vika-game
./scripts/verify-server-deployment.sh
```

Ce script vérifie :
- ✅ Statut Git et synchronisation
- ✅ Installation Docker et Docker Compose
- ✅ État de tous les conteneurs
- ✅ Logs des services principaux
- ✅ Routes Traefik pour Grafana
- ✅ Accessibilité web
- ✅ Services critiques (MongoDB, Redis, API Gateway)

## 🔍 Vérifications Manuelles

### 1. Vérifier les logs des conteneurs

```bash
# Frontend
docker-compose logs --tail=50 frontend

# API Gateway
docker-compose logs --tail=50 api-gateway

# Game Service
docker-compose logs --tail=50 game

# Traefik
docker-compose logs --tail=50 traefik

# Grafana
docker-compose logs --tail=50 grafana
```

### 2. Vérifier les routes Traefik pour Grafana

Les routes suivantes doivent rediriger vers les dashboards Grafana :

- **API Gateway Monitoring**: `http://82.202.141.248/api-gateway-monitoring`
  - Doit rediriger vers: `http://82.202.141.248:3005/d/api-gateway-dashboard/api-gateway-monitoring`

- **Container Monitoring**: `http://82.202.141.248/container-monitoring`
  - Doit rediriger vers: `http://82.202.141.248:3005/d/containers-dashboard/containers-monitoring`

Test avec curl :

```bash
# Test API Gateway Monitoring
curl -I http://82.202.141.248/api-gateway-monitoring

# Test Container Monitoring
curl -I http://82.202.141.248/container-monitoring
```

Les deux doivent retourner un code HTTP 307 (Temporary Redirect).

### 3. Vérifier l'accessibilité web

```bash
# Page d'accueil
curl -I http://82.202.141.248/vika-game/

# Doit retourner HTTP 200
```

### 4. Vérifier les services critiques

```bash
# MongoDB
docker-compose exec mongodb mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok"

# Redis
docker-compose exec redis redis-cli ping

# API Gateway Health
curl http://localhost:3000/health
```

## 🐛 Dépannage

### Problème: Routes Grafana retournent 404

1. Vérifier que Grafana est en cours d'exécution :
   ```bash
   docker-compose ps grafana
   ```

2. Vérifier les labels Traefik de Grafana :
   ```bash
   docker inspect intelectgame-grafana | grep -A 20 "Labels"
   ```

3. Redémarrer Traefik :
   ```bash
   docker-compose restart traefik
   ```

4. Vérifier les routes dans le dashboard Traefik :
   - Accéder à: `http://82.202.141.248:8080/dashboard/`
   - Vérifier que les routes `grafana-api-gateway` et `grafana-container` sont présentes

### Problème: Conteneurs ne démarrent pas

1. Vérifier les logs d'erreur :
   ```bash
   docker-compose logs [service-name]
   ```

2. Vérifier les dépendances :
   ```bash
   docker-compose ps
   ```
   Les services dépendants (MongoDB, Redis) doivent démarrer en premier.

3. Reconstruire les images :
   ```bash
   docker-compose build --no-cache [service-name]
   docker-compose up -d [service-name]
   ```

### Problème: Modifications non visibles

1. Vérifier que les modifications sont bien pullées :
   ```bash
   git log --oneline -5
   ```

2. Reconstruire les conteneurs frontend :
   ```bash
   docker-compose up -d --build frontend admin-frontend
   ```

3. Vider le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)

## 📊 Dashboard Traefik

Accéder au dashboard Traefik pour voir toutes les routes configurées :

```
http://82.202.141.248:8080/dashboard/
```

## 📝 Checklist de Vérification

- [ ] Git pull effectué sur le serveur
- [ ] Tous les conteneurs en état "Up"
- [ ] Aucune erreur dans les logs
- [ ] Route `/api-gateway-monitoring` fonctionne (HTTP 307)
- [ ] Route `/container-monitoring` fonctionne (HTTP 307)
- [ ] Page d'accueil accessible (HTTP 200)
- [ ] MongoDB accessible
- [ ] Redis accessible
- [ ] API Gateway health check OK


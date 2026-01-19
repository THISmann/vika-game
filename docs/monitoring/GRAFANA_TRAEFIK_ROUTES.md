# ✅ Routes Traefik pour les Dashboards Grafana

## 📋 Routes Créées

Deux routes Traefik ont été créées pour accéder facilement aux dashboards Grafana :

### 1. `/api-gateway-monitoring`
**URL complète** : `http://localhost/api-gateway-monitoring`

**Redirige vers** : `http://localhost:3005/d/api-gateway-dashboard/api-gateway-monitoring?orgId=1&from=now-1h&to=now&timezone=browser&refresh=10s`

### 2. `/container-monitoring`
**URL complète** : `http://localhost/container-monitoring`

**Redirige vers** : `http://localhost:3005/d/containers-dashboard/containers-monitoring?orgId=1&from=now-6h&to=now&timezone=browser&refresh=10s`

## 🔧 Configuration

Les routes sont configurées dans `docker-compose.yml` avec :

- **Priority** : 25 (pour être prioritaire sur d'autres routes)
- **Entrypoint** : `web` (port 80)
- **Middleware** : Redirect regex vers Grafana (port 3005)
- **Service** : Grafana sur le port 3000 (exposé sur 3005)

## 📝 Labels Traefik

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.docker.network=user1_app-network"
  - "traefik.http.services.grafana.loadbalancer.server.port=3000"
  # Middleware de redirect pour /api-gateway-monitoring
  - "traefik.http.middlewares.grafana-api-gateway-redirect.redirectregex.regex=^http://([^/]+)/api-gateway-monitoring(.*)"
  - "traefik.http.middlewares.grafana-api-gateway-redirect.redirectregex.replacement=http://$$1:3005/d/api-gateway-dashboard/api-gateway-monitoring?orgId=1&from=now-1h&to=now&timezone=browser&refresh=10s"
  - "traefik.http.middlewares.grafana-api-gateway-redirect.redirectregex.permanent=false"
  # Middleware de redirect pour /container-monitoring
  - "traefik.http.middlewares.grafana-container-redirect.redirectregex.regex=^http://([^/]+)/container-monitoring(.*)"
  - "traefik.http.middlewares.grafana-container-redirect.redirectregex.replacement=http://$$1:3005/d/containers-dashboard/containers-monitoring?orgId=1&from=now-6h&to=now&timezone=browser&refresh=10s"
  - "traefik.http.middlewares.grafana-container-redirect.redirectregex.permanent=false"
  # Route pour /api-gateway-monitoring
  - "traefik.http.routers.grafana-api-gateway.rule=Path(`/api-gateway-monitoring`)"
  - "traefik.http.routers.grafana-api-gateway.entrypoints=web"
  - "traefik.http.routers.grafana-api-gateway.middlewares=grafana-api-gateway-redirect"
  - "traefik.http.routers.grafana-api-gateway.priority=25"
  # Route pour /container-monitoring
  - "traefik.http.routers.grafana-container.rule=Path(`/container-monitoring`)"
  - "traefik.http.routers.grafana-container.entrypoints=web"
  - "traefik.http.routers.grafana-container.middlewares=grafana-container-redirect"
  - "traefik.http.routers.grafana-container.priority=25"
```

## ✅ Utilisation

### Accès Local
- **API Gateway Dashboard** : `http://localhost/api-gateway-monitoring`
- **Containers Dashboard** : `http://localhost/container-monitoring`

### Accès Serveur en Ligne
- **API Gateway Dashboard** : `http://82.202.141.248/api-gateway-monitoring`
- **Containers Dashboard** : `http://82.202.141.248/container-monitoring`

## 🔄 Redémarrage

Après modification de `docker-compose.yml`, redémarrer Traefik :

```bash
docker restart intelectgame-traefik
```

Attendre 15-20 secondes pour que Traefik recharge la configuration.

## 🔍 Vérification

### Vérifier que les routes sont actives

```bash
# Vérifier les routes dans Traefik
curl http://localhost:8080/api/http/routers | grep grafana

# Tester les redirects
curl -I http://localhost/api-gateway-monitoring
curl -I http://localhost/container-monitoring
```

### Vérifier les middlewares

```bash
curl http://localhost:8080/api/http/middlewares | grep grafana
```

## 📝 Notes

- Les routes utilisent des **redirects HTTP 302** (temporaires)
- Les paramètres de dashboard (orgId, from, to, etc.) sont inclus dans l'URL de redirect
- Les routes ont une **priorité de 25** pour être prioritaires sur d'autres routes
- Grafana doit être accessible sur le port **3005** pour que les redirects fonctionnent

---

**Date**: $(date)
**Status**: ✅ Routes configurées dans Traefik


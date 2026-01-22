# Fix Grafana Subpath - Page Not Found

## 🔍 Problème

Grafana s'ouvre bien à `http://vika-game.ru/grafana/login` mais affiche "page not found" après le login.

### Symptômes
- Page de login Grafana accessible
- Après login, affichage de "page not found"
- Base href dans le HTML est `/` au lieu de `/grafana/`
- Les assets (CSS/JS) ne se chargent pas correctement

## 🔧 Corrections Appliquées

### 1. Configuration Grafana
**Fichier**: `monitoring/grafana/grafana.ini`
```ini
[server]
root_url = http://vika-game.ru/grafana
serve_from_sub_path = true
domain = vika-game.ru
protocol = http
```

**Fichier**: `docker-compose.yml`
```yaml
environment:
  - GF_SERVER_ROOT_URL=http://vika-game.ru/grafana
  - GF_SERVER_SERVE_FROM_SUB_PATH=true
  - GF_SERVER_DOMAIN=vika-game.ru
  - GF_SERVER_PROTOCOL=http
```

### 2. Configuration Traefik
**Fichier**: `docker-compose.yml`

**Avant** (avec strip-prefix):
```yaml
- "traefik.http.middlewares.grafana-strip-prefix.stripprefix.prefixes=/grafana"
- "traefik.http.routers.grafana-main.middlewares=grafana-strip-prefix,grafana-headers"
```

**Après** (avec path rewrite):
```yaml
- "traefik.http.middlewares.grafana-path-rewrite.replacepathregex.regex=^/grafana(.*)"
- "traefik.http.middlewares.grafana-path-rewrite.replacepathregex.replacement=$$1"
- "traefik.http.routers.grafana-main.middlewares=grafana-path-rewrite,grafana-headers"
```

### Explication
- Le middleware `strip-prefix` supprimait complètement le préfixe `/grafana` avant d'envoyer à Grafana
- Grafana a besoin de recevoir les requêtes à la racine (`/login`, `/api/health`, etc.) mais avec la configuration `root_url` pour générer correctement le base href
- Le middleware `replacepathregex` réécrit `/grafana/*` en `/*` tout en permettant à Grafana de générer le base href correctement grâce à `root_url`

## ✅ Tests

### 1. Vérification du Base Href
```bash
curl -s -H 'Host: vika-game.ru' http://localhost/grafana/login | grep 'base href'
```
**Résultat attendu**: `<base href="/grafana/" />`

### 2. Vérification de l'API Health
```bash
curl -s -H 'Host: vika-game.ru' http://localhost/grafana/api/health
```
**Résultat attendu**: `200 OK`

### 3. Vérification des Assets
```bash
curl -s -H 'Host: vika-game.ru' http://localhost/grafana/public/build/grafana.app.*.css
```
**Résultat attendu**: Contenu CSS chargé

## 📋 Routes Fonctionnelles

- ✅ `http://vika-game.ru/grafana/login` - Page de login
- ✅ `http://vika-game.ru/grafana/api/health` - API health check
- ✅ `http://vika-game.ru/grafana/api/*` - API Grafana
- ✅ `http://vika-game.ru/api-gateway-monitoring` - Dashboard API Gateway
- ✅ `http://vika-game.ru/container-monitoring` - Dashboard Containers

## 🔐 Identifiants

- **Username**: `admin`
- **Password**: `admin`

## ⚠️ Note Importante

Si le base href est toujours `/` après ces corrections :
1. Vérifier que les variables d'environnement sont correctement définies dans `docker-compose.yml`
2. Redémarrer complètement le container Grafana : `docker-compose stop grafana && docker-compose rm -f grafana && docker-compose up -d grafana`
3. Vérifier les logs Grafana : `docker-compose logs grafana | grep -i 'root_url\|sub_path'`

## 🚀 Déploiement

```bash
# Sur le serveur
cd ~/vika-game
git pull origin main
docker-compose restart grafana traefik
# Ou pour un redémarrage complet
docker-compose stop grafana && docker-compose rm -f grafana && docker-compose up -d grafana
```

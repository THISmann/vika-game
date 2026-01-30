# Instructions de Déploiement - Domaine vika-game.ru

## ✅ Modifications Effectuées

1. **docker-compose.yml** : Configuration du domaine vika-game.ru avec HTTPS
2. **monitoring/grafana/grafana.ini** : Mise à jour pour HTTPS
3. **README.md** : Toutes les URLs mises à jour avec le domaine
4. **.gitignore** : Ajout de letsencrypt/ pour ignorer les certificats

## 🚀 Déploiement sur le Serveur

### 1. Push les modifications (si pas encore fait)

```bash
git push origin main
```

Si erreur SSL, utilisez SSH ou configurez Git :
```bash
git config --global http.sslVerify false  # Temporaire
git push origin main
```

### 2. Sur le serveur (82.202.141.248)

```bash
# Se connecter au serveur
ssh user1@82.202.141.248

# Aller dans le répertoire du projet
cd /path/to/vika-game   # ou le chemin réel du clone

# Pull les dernières modifications
git pull origin main

# Créer le dossier letsencrypt avec les bonnes permissions
mkdir -p letsencrypt
chmod 700 letsencrypt

# Redémarrer uniquement les frontends après un fix d'API (évite KeyError ContainerConfig)
docker-compose up -d --no-deps frontend admin-frontend

# OU tout redémarrer
# docker-compose down && docker-compose up -d

# Vérifier les logs Traefik pour Let's Encrypt
docker-compose logs -f traefik
```

**Fix 404 sur `/api/users/login`** : Les frontends doivent être buildés avec `VITE_AUTH_SERVICE_URL=/api/auth` (et `/api/quiz`, `/api/game`). Après `git pull`, utiliser le script qui évite le bug `ContainerConfig` : `./scripts/update-frontends-on-server.sh`. Si le service auth est en Exit 137 : `docker rm -f intelectgame-auth 2>/dev/null; docker-compose up -d auth`.

### 3. Vérification DNS

Assurez-vous que le domaine pointe vers l'IP :
```bash
# Sur votre machine locale
ping vika-game.ru
nslookup vika-game.ru
# Devrait retourner : 82.202.141.248
```

### 4. Vérification HTTPS

```bash
# Tester l'accès HTTPS
curl -I https://vika-game.ru

# Vérifier le certificat SSL
openssl s_client -connect vika-game.ru:443 -servername vika-game.ru
```

### 5. Routes à Tester

- ✅ https://vika-game.ru (Frontend utilisateur)
- ✅ https://admin.vika-game.ru (Frontend admin)
- ✅ https://vika-game.ru/dashboard/ (Traefik Dashboard)
- ✅ https://vika-game.ru/login (Grafana)
- ✅ https://vika-game.ru/api-gateway-monitoring (Grafana API Gateway)
- ✅ https://vika-game.ru/container-monitoring (Grafana Containers)
- ✅ https://vika-game.ru/vika-game/api/auth/login (API)

## ⚠️ Problèmes Potentiels

### Certificat SSL ne se génère pas

1. Vérifier que le port 80 est accessible :
```bash
curl -I http://vika-game.ru
```

2. Vérifier les logs Traefik :
```bash
docker-compose logs traefik | grep -i acme
```

3. Vérifier les permissions du dossier letsencrypt :
```bash
ls -la letsencrypt/
chmod 700 letsencrypt
```

### DNS ne pointe pas vers l'IP

Vérifier les enregistrements DNS chez votre registrar :
- Type A : @ → 82.202.141.248
- Type A : www → 82.202.141.248

Délai de propagation : 15 minutes à 48 heures

### Erreur 404 sur les routes

Vérifier que les labels Traefik sont corrects :
```bash
docker-compose config | grep -A 5 "traefik.http.routers"
```

## 📝 Notes

- Le certificat Let's Encrypt se renouvelle automatiquement tous les 90 jours
- Le premier certificat peut prendre 1-2 minutes à générer
- Les redirections HTTP → HTTPS sont automatiques
- Le dossier `letsencrypt/` contient les certificats (ne pas commiter)

## 🔗 URLs Finales

- **Frontend** : https://vika-game.ru
- **Admin** : https://admin.vika-game.ru
- **API** : https://vika-game.ru/vika-game/api
- **Traefik Dashboard** : https://vika-game.ru/dashboard/
- **Grafana** : https://vika-game.ru/login
- **Prometheus** : http://82.202.141.248:9090 (direct)

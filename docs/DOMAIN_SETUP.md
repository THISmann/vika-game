# Configuration d'un Nom de Domaine - vika-game.ru

Guide complet pour relier votre application IntelectGame V2 au nom de domaine `vika-game.ru`.

## 📋 Vue d'ensemble

Actuellement, votre application est accessible via l'IP `82.202.141.248`. Pour utiliser le domaine `vika-game.ru`, vous devez :
1. Acheter le domaine
2. Configurer les enregistrements DNS
3. Configurer Traefik pour accepter le domaine
4. Configurer SSL/HTTPS (Let's Encrypt)
5. Mettre à jour les configurations

## 🛒 Étape 1 : Achat du Domaine

### Où acheter ?
- **Reg.ru** (recommandé pour .ru)
- **Namecheap**
- **GoDaddy**
- **Cloudflare Registrar**

### Informations nécessaires
- Nom de domaine : `vika-game.ru`
- Durée : 1 an minimum (recommandé : 2-3 ans)
- Contact : Vos coordonnées (obligatoire pour .ru)

## 🔧 Étape 2 : Configuration DNS

Après l'achat, vous devez configurer les enregistrements DNS chez votre registrar.

### Enregistrements DNS à créer

#### 1. Enregistrement A (Principal)
```
Type: A
Nom: @ (ou vika-game.ru)
Valeur: 82.202.141.248
TTL: 3600 (1 heure)
```

#### 2. Enregistrement A (www)
```
Type: A
Nom: www
Valeur: 82.202.141.248
TTL: 3600
```

#### 3. Enregistrement A (API - optionnel)
```
Type: A
Nom: api
Valeur: 82.202.141.248
TTL: 3600
```

#### 4. Enregistrement CNAME (monitoring - optionnel)
```
Type: CNAME
Nom: monitoring
Valeur: vika-game.ru
TTL: 3600
```

### Exemple de configuration complète

```
@                    A      82.202.141.248    3600
www                  A      82.202.141.248    3600
api                  A      82.202.141.248    3600
monitoring           CNAME  vika-game.ru      3600
```

### Où configurer ?
1. Connectez-vous à votre registrar (ex: reg.ru)
2. Allez dans "Gestion DNS" ou "DNS Management"
3. Ajoutez les enregistrements ci-dessus
4. Sauvegardez les modifications

**⏱️ Délai de propagation** : 15 minutes à 48 heures (généralement 1-2 heures)

## 🔒 Étape 3 : Configuration SSL/HTTPS avec Let's Encrypt

### Prérequis
- Le domaine doit pointer vers votre IP (vérifiez avec `ping vika-game.ru`)
- Le port 80 et 443 doivent être ouverts sur votre serveur
- Traefik doit être configuré pour Let's Encrypt

### Configuration Traefik

Modifiez `docker-compose.yml` pour ajouter Let's Encrypt :

```yaml
traefik:
  image: traefik:v2.11
  container_name: intelectgame-traefik
  command:
    - "--api.insecure=true"
    - "--api.dashboard=true"
    - "--providers.docker=true"
    - "--providers.docker.exposedbydefault=false"
    - "--providers.docker.network=user1_app-network"
    - "--entrypoints.web.address=:80"
    - "--entrypoints.websecure.address=:443"
    # Let's Encrypt configuration
    - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
    - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    - "--log.level=INFO"
    - "--accesslog=true"
  ports:
    - "80:80"
    - "443:443"
    - "8080:8080"
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - ./letsencrypt:/letsencrypt
  networks:
    - app-network
```

### Mise à jour des Labels Traefik

Ajoutez les labels SSL pour chaque service :

#### Frontend
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`vika-game.ru`) || Host(`www.vika-game.ru`)"
  - "traefik.http.routers.frontend.entrypoints=websecure"
  - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
  - "traefik.http.routers.frontend.service=frontend"
  - "traefik.http.routers.frontend-http.rule=Host(`vika-game.ru`) || Host(`www.vika-game.ru`)"
  - "traefik.http.routers.frontend-http.entrypoints=web"
  - "traefik.http.routers.frontend-http.middlewares=redirect-to-https"
  - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
  - "traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true"
```

#### Admin Frontend
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.admin.rule=Host(`admin.vika-game.ru`)"
  - "traefik.http.routers.admin.entrypoints=websecure"
  - "traefik.http.routers.admin.tls.certresolver=letsencrypt"
  - "traefik.http.routers.admin.service=admin-frontend"
```

#### API Gateway
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.api-gateway.rule=Host(`api.vika-game.ru`) || Host(`vika-game.ru`) && PathPrefix(`/api`)"
  - "traefik.http.routers.api-gateway.entrypoints=websecure"
  - "traefik.http.routers.api-gateway.tls.certresolver=letsencrypt"
```

## 📝 Étape 4 : Mise à jour des Configurations

### 1. Mettre à jour Grafana

Modifiez `monitoring/grafana/grafana.ini` :
```ini
[server]
root_url = https://vika-game.ru
domain = vika-game.ru
protocol = https
```

### 2. Mettre à jour les Variables d'Environnement

Mettez à jour les URLs dans les services qui référencent l'IP :
- Frontend : `VITE_API_URL=https://vika-game.ru/api`
- API Gateway : URLs de callback

### 3. Mettre à jour le README.md

Remplacez `82.202.141.248` par `vika-game.ru` dans la documentation.

## 🔍 Étape 5 : Vérification

### Vérifier la propagation DNS
```bash
# Vérifier que le domaine pointe vers votre IP
ping vika-game.ru
nslookup vika-game.ru
dig vika-game.ru

# Devrait retourner : 82.202.141.248
```

### Vérifier l'accès HTTP
```bash
curl -I http://vika-game.ru
# Devrait retourner 200 ou 301 (redirection HTTPS)
```

### Vérifier l'accès HTTPS
```bash
curl -I https://vika-game.ru
# Devrait retourner 200 avec certificat SSL valide
```

### Vérifier le certificat SSL
```bash
openssl s_client -connect vika-game.ru:443 -servername vika-game.ru
# Vérifier que le certificat est émis par Let's Encrypt
```

## 🚀 Déploiement

### 1. Créer le dossier Let's Encrypt
```bash
mkdir -p letsencrypt
chmod 600 letsencrypt
```

### 2. Mettre à jour docker-compose.yml
```bash
# Éditer docker-compose.yml avec les nouvelles configurations
nano docker-compose.yml
```

### 3. Redémarrer les services
```bash
docker-compose down
docker-compose up -d
```

### 4. Vérifier les logs Traefik
```bash
docker-compose logs -f traefik
# Chercher les messages sur Let's Encrypt
```

## 📊 Routes Finales avec Domaine

### Routes Principales
- **Frontend Utilisateur** : https://vika-game.ru
- **Frontend Admin** : https://admin.vika-game.ru
- **API Gateway** : https://api.vika-game.ru ou https://vika-game.ru/api
- **Traefik Dashboard** : https://vika-game.ru/dashboard/
- **Grafana** : https://vika-game.ru:3005 ou https://monitoring.vika-game.ru

### Redirections
- http://vika-game.ru → https://vika-game.ru (301)
- http://www.vika-game.ru → https://vika-game.ru (301)

## ⚠️ Problèmes Courants

### 1. DNS ne pointe pas vers l'IP
**Solution** : Vérifier les enregistrements DNS, attendre la propagation (jusqu'à 48h)

### 2. Certificat SSL ne se génère pas
**Solution** : 
- Vérifier que le port 80 est accessible depuis l'extérieur
- Vérifier que le domaine pointe bien vers l'IP
- Vérifier les logs Traefik : `docker-compose logs traefik`

### 3. Erreur "Certificate validation failed"
**Solution** :
- Vérifier que le fichier `acme.json` a les bonnes permissions (600)
- Vérifier que le port 80 n'est pas bloqué par un firewall
- Vérifier que Traefik peut accéder à Let's Encrypt

### 4. Redirection infinie
**Solution** : Vérifier que les middlewares de redirection sont correctement configurés

## 🔐 Sécurité

### Recommandations
1. **Toujours utiliser HTTPS** : Rediriger tout le trafic HTTP vers HTTPS
2. **HSTS** : Ajouter le header HSTS pour forcer HTTPS
3. **Renouvellement automatique** : Let's Encrypt renouvelle automatiquement les certificats
4. **Firewall** : Configurer le firewall pour n'autoriser que les ports 80, 443, et les ports nécessaires

### Configuration HSTS (optionnel)
```yaml
labels:
  - "traefik.http.middlewares.secure-headers.headers.stsSeconds=31536000"
  - "traefik.http.middlewares.secure-headers.headers.stsIncludeSubdomains=true"
  - "traefik.http.middlewares.secure-headers.headers.stsPreload=true"
```

## 📝 Checklist Complète

- [ ] Domaine acheté (vika-game.ru)
- [ ] Enregistrements DNS configurés (A, CNAME)
- [ ] Propagation DNS vérifiée (ping, nslookup)
- [ ] Ports 80 et 443 ouverts sur le serveur
- [ ] Traefik configuré pour Let's Encrypt
- [ ] Dossier letsencrypt créé avec permissions 600
- [ ] Labels Traefik mis à jour avec le domaine
- [ ] Grafana.ini mis à jour
- [ ] Variables d'environnement mises à jour
- [ ] Services redémarrés
- [ ] Certificat SSL vérifié
- [ ] Accès HTTPS testé
- [ ] Redirection HTTP → HTTPS testée
- [ ] Documentation mise à jour

## 🔄 Migration depuis l'IP

### Période de transition
Pendant la migration, vous pouvez maintenir les deux accès :
- Ancien : http://82.202.141.248
- Nouveau : https://vika-game.ru

### Redirection depuis l'IP (optionnel)
Ajoutez une redirection dans Traefik pour rediriger l'accès par IP vers le domaine :
```yaml
labels:
  - "traefik.http.routers.ip-redirect.rule=Host(`82.202.141.248`)"
  - "traefik.http.routers.ip-redirect.entrypoints=web"
  - "traefik.http.routers.ip-redirect.middlewares=redirect-to-domain"
  - "traefik.http.middlewares.redirect-to-domain.redirectregex.regex=^https?://82.202.141.248(.*)"
  - "traefik.http.middlewares.redirect-to-domain.redirectregex.replacement=https://vika-game.ru$${1}"
```

## 📚 Ressources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Traefik ACME Documentation](https://doc.traefik.io/traefik/https/acme/)
- [DNS Propagation Checker](https://www.whatsmydns.net/)

---

**Dernière mise à jour** : Janvier 2026
**Domaine cible** : vika-game.ru
**IP serveur** : 82.202.141.248

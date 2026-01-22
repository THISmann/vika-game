# Diagnostic et Résolution des Problèmes - vika-game.ru

## 🔍 Problèmes Courants et Solutions

### 1. Le domaine ne répond pas (HTTP/HTTPS)

#### Vérifications à faire :

**a) DNS ne pointe pas vers l'IP**
```bash
# Vérifier le DNS
dig vika-game.ru @8.8.8.8
nslookup vika-game.ru
ping vika-game.ru

# Doit retourner : 82.202.141.248
```

**Solution** :
- Connectez-vous à votre registrar (reg.ru, Namecheap, etc.)
- Allez dans "Gestion DNS"
- Ajoutez/modifiez l'enregistrement A :
  - Type: A
  - Nom: @ (ou vika-game.ru)
  - Valeur: 82.202.141.248
  - TTL: 3600
- Attendez la propagation (15 min - 48h)

**b) Ports 80 et 443 non ouverts**

```bash
# Sur le serveur, vérifier les ports
sudo netstat -tlnp | grep -E ':(80|443)'
sudo ufw status
sudo iptables -L -n | grep -E ':(80|443)'
```

**Solution** :
```bash
# Ouvrir les ports avec ufw
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# Ou avec iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

**c) Traefik n'écoute pas sur les ports**

```bash
# Vérifier que Traefik est démarré
docker-compose ps traefik

# Vérifier les logs
docker-compose logs traefik

# Vérifier que les ports sont bien mappés
docker ps | grep traefik
```

**Solution** :
```bash
# Redémarrer Traefik
docker-compose restart traefik

# Ou redémarrer tous les services
docker-compose down
docker-compose up -d
```

### 2. Erreur 404 Not Found

#### Causes possibles :

**a) Routes Traefik incorrectes**

Vérifier que les labels Traefik sont corrects :
```bash
docker-compose config | grep -A 10 "traefik.http.routers"
```

**b) Frontend non démarré**

```bash
# Vérifier le statut du frontend
docker-compose ps frontend
docker-compose logs frontend
```

**Solution** :
```bash
# Redémarrer le frontend
docker-compose restart frontend
```

### 3. Certificat SSL non généré (HTTPS ne fonctionne pas)

#### Vérifications :

**a) Port 80 accessible pour Let's Encrypt**

Let's Encrypt doit pouvoir accéder au port 80 pour valider le domaine :
```bash
# Tester depuis l'extérieur
curl -I http://vika-game.ru/.well-known/acme-challenge/test
```

**b) Dossier letsencrypt avec bonnes permissions**

```bash
# Sur le serveur
ls -la letsencrypt/
# Doit avoir les permissions 700

# Si nécessaire
chmod 700 letsencrypt
```

**c) Logs Traefik pour Let's Encrypt**

```bash
docker-compose logs traefik | grep -i acme
docker-compose logs traefik | grep -i certificate
```

**Solutions** :

1. **Vérifier les permissions** :
```bash
mkdir -p letsencrypt
chmod 700 letsencrypt
```

2. **Vérifier que le port 80 est accessible** :
```bash
# Depuis l'extérieur
curl -I http://vika-game.ru
```

3. **Forcer le renouvellement du certificat** :
```bash
# Supprimer l'ancien certificat (si nécessaire)
rm -rf letsencrypt/acme.json
docker-compose restart traefik
```

4. **Vérifier l'email dans la configuration** :
```yaml
# Dans docker-compose.yml
- "--certificatesresolvers.letsencrypt.acme.email=admin@vika-game.ru"
```

### 4. Redirection HTTP → HTTPS ne fonctionne pas

#### Vérification :

```bash
# Tester la redirection
curl -I http://vika-game.ru
# Doit retourner 301 ou 302 avec Location: https://vika-game.ru
```

**Solution** :

Vérifier que le middleware `redirect-to-https` est bien défini dans les labels Traefik :
```yaml
- "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
- "traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true"
```

### 5. Route racine `/` ne fonctionne pas

#### Problème :

Le frontend est configuré pour être servi depuis `/vika-game/`, donc la racine `/` doit rediriger.

**Solution** :

Une route de redirection a été ajoutée dans la configuration. Vérifier :
```bash
docker-compose config | grep -A 5 "frontend-root"
```

Si elle n'existe pas, elle redirige `/` vers `/vika-game/`.

## 🔧 Commandes de Diagnostic

### Test complet du domaine

```bash
# Utiliser le script de test
./test-domain.sh
```

### Vérifications manuelles

```bash
# 1. DNS
dig vika-game.ru @8.8.8.8

# 2. HTTP
curl -I http://vika-game.ru

# 3. HTTPS
curl -I -k https://vika-game.ru

# 4. Redirection
curl -L http://vika-game.ru

# 5. Certificat SSL
openssl s_client -connect vika-game.ru:443 -servername vika-game.ru

# 6. Routes spécifiques
curl -I https://vika-game.ru/vika-game
curl -I https://vika-game.ru/dashboard/
curl -I https://vika-game.ru/vika-game/api/health
```

### Sur le serveur

```bash
# 1. Vérifier les services
docker-compose ps

# 2. Vérifier les logs
docker-compose logs traefik
docker-compose logs frontend
docker-compose logs api-gateway

# 3. Vérifier les routes Traefik
curl http://localhost:8080/api/http/routers

# 4. Vérifier les services Traefik
curl http://localhost:8080/api/http/services
```

## 📋 Checklist de Déploiement

- [ ] DNS configuré et propagé (vérifier avec `dig`)
- [ ] Ports 80 et 443 ouverts sur le serveur
- [ ] Dossier `letsencrypt/` créé avec permissions 700
- [ ] Services Docker démarrés (`docker-compose ps`)
- [ ] Traefik écoute sur les ports 80 et 443
- [ ] Certificat SSL généré (vérifier dans `letsencrypt/acme.json`)
- [ ] Routes Traefik configurées (vérifier avec `curl http://localhost:8080/api/http/routers`)
- [ ] Frontend accessible sur `/vika-game`
- [ ] Redirection `/` → `/vika-game` fonctionne
- [ ] Redirection HTTP → HTTPS fonctionne

## 🚀 Redémarrage Complet

Si rien ne fonctionne, procédure de redémarrage complet :

```bash
# 1. Arrêter tous les services
docker-compose down

# 2. Vérifier la configuration
docker-compose config > /tmp/docker-compose-check.yml
# Vérifier qu'il n'y a pas d'erreurs

# 3. Créer le dossier letsencrypt si nécessaire
mkdir -p letsencrypt
chmod 700 letsencrypt

# 4. Redémarrer
docker-compose up -d

# 5. Vérifier les logs
docker-compose logs -f traefik
```

## 📞 Support

Si le problème persiste :

1. Vérifier les logs : `docker-compose logs`
2. Vérifier la configuration : `docker-compose config`
3. Tester avec le script : `./test-domain.sh`
4. Vérifier le DNS : `dig vika-game.ru`
5. Vérifier les ports : `netstat -tlnp | grep -E ':(80|443)'`

# 🔧 Traefik Dashboard - Configuration et Accès

## 📋 URLs d'accès au Dashboard Traefik

Le dashboard Traefik est accessible via les URLs suivantes :

### ✅ Port 8080 (Recommandé - Port dédié)
```
http://localhost:8080/dashboard/
```

### ⚠️ Port 80 (Non configuré actuellement)
Le dashboard n'est **pas** accessible sur `http://localhost/` car :
- Le port 80 est utilisé pour router les autres services (frontend, API Gateway, etc.)
- Le dashboard Traefik utilise un service interne (`api@internal`) qui nécessite une configuration spéciale
- Pour des raisons de sécurité, le dashboard est isolé sur le port 8080

## 🔍 Vérification

Pour vérifier que le dashboard fonctionne :

```bash
# Vérifier que le container Traefik est démarré
docker ps | grep traefik

# Tester l'accès au dashboard
curl http://localhost:8080/dashboard/

# Vérifier les routes configurées
curl http://localhost:8080/api/http/routers | jq .
```

## ⚙️ Configuration actuelle

Dans `docker-compose.yml` :

```yaml
traefik:
  command:
    - "--api.insecure=true"      # Active le dashboard en mode insecure
    - "--api.dashboard=true"     # Active le dashboard
  ports:
    - "80:80"                    # Port pour router les services
    - "8080:8080"                # Port pour le dashboard
```

## 📝 Notes

- **Mode insecure** : Le dashboard est accessible sans authentification (uniquement pour le développement local)
- **En production** : Il est recommandé de désactiver `api.insecure=true` et de configurer une authentification
- **Port 8080** : Port dédié pour le dashboard et l'API Traefik


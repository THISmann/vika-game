# Vérification Prometheus - Pourquoi c'est vide

## Étapes de diagnostic

### 1. Vérifier que Prometheus peut scraper les targets

Allez sur http://localhost:9090/targets

Vous devriez voir :
- `prometheus` (localhost:9090) - devrait être UP
- `api-gateway` (api-gateway:3000) - devrait être UP
- `cadvisor` (cadvisor:8080) - devrait être UP
- `node-exporter` (node-exporter:9100) - devrait être UP

Si un target est DOWN, cliquez dessus pour voir l'erreur.

### 2. Vérifier que l'API Gateway expose les métriques

```bash
# Depuis votre machine
curl http://localhost:3000/metrics | head -50

# Ou depuis le container Prometheus
docker-compose exec prometheus wget -O- http://api-gateway:3000/metrics | head -50
```

Vous devriez voir des métriques au format Prometheus.

### 3. Vérifier que cAdvisor expose les métriques

```bash
# Depuis votre machine
curl http://localhost:8080/metrics | head -50

# Ou depuis le container Prometheus
docker-compose exec prometheus wget -O- http://cadvisor:8080/metrics | head -50
```

### 4. Vérifier les métriques dans Prometheus

Allez sur http://localhost:9090 et testez ces requêtes :

```
http_requests_total
container_cpu_usage_seconds_total
container_memory_usage_bytes
```

Si aucune métrique n'apparaît, cela signifie que Prometheus ne peut pas scraper les targets.

### 5. Vérifier les logs Prometheus

```bash
docker-compose logs prometheus | tail -100
```

Cherchez des erreurs comme :
- `connection refused`
- `no such host`
- `timeout`

### 6. Vérifier la connectivité réseau

```bash
# Tester depuis Prometheus vers API Gateway
docker-compose exec prometheus ping -c 2 api-gateway

# Tester depuis Prometheus vers cAdvisor
docker-compose exec prometheus ping -c 2 cadvisor
```

### 7. Vérifier que tous les services sont démarrés

```bash
docker-compose ps
```

Tous les services doivent être "Up" (sauf ceux qui sont arrêtés intentionnellement).

### 8. Redémarrer Prometheus

Si tout semble correct mais que Prometheus est toujours vide :

```bash
docker-compose restart prometheus
```

Attendez 30 secondes puis vérifiez à nouveau http://localhost:9090/targets

### 9. Vérifier la configuration Prometheus

```bash
docker-compose exec prometheus cat /etc/prometheus/prometheus.yml
```

La configuration doit correspondre à `monitoring/prometheus/prometheus.yml`

## Solutions courantes

### Problème : Targets DOWN

**Solution** : Vérifier que les services sont démarrés et accessibles
```bash
docker-compose ps
docker-compose up -d api-gateway cadvisor
```

### Problème : "connection refused" ou "no such host"

**Solution** : Vérifier que Prometheus est sur le réseau `app-network`
- Vérifier dans `docker-compose.yml` que Prometheus a `networks: - app-network`
- Redémarrer Prometheus : `docker-compose restart prometheus`

### Problème : Métriques API Gateway non disponibles

**Solution** : Vérifier que l'API Gateway expose `/metrics`
```bash
curl http://localhost:3000/metrics
```

Si cela ne fonctionne pas, vérifier les logs de l'API Gateway :
```bash
docker-compose logs api-gateway | grep -i metric
```

### Problème : cAdvisor ne fonctionne pas

**Solution** : Vérifier que cAdvisor est démarré et accessible
```bash
docker-compose ps cadvisor
curl http://localhost:8080/metrics | head -20
```

Si cAdvisor ne démarre pas, vérifier les logs :
```bash
docker-compose logs cadvisor
```

cAdvisor nécessite des privilèges élevés et accès à `/var/run/docker.sock`.


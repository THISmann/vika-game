# Dépannage Prometheus et Grafana

## Problème : Prometheus est vide

Si Prometheus n'affiche aucune métrique, vérifiez :

### 1. Vérifier que les services sont sur le même réseau

Prometheus doit être sur le réseau `app-network` pour pouvoir scraper les autres services.

Vérifiez dans `docker-compose.yml` que Prometheus a bien :
```yaml
networks:
  - app-network
```

### 2. Vérifier que l'API Gateway expose les métriques

Testez manuellement :
```bash
docker-compose exec api-gateway curl http://localhost:3000/metrics
```

Ou depuis votre machine :
```bash
curl http://localhost:3000/metrics
```

Vous devriez voir des métriques au format Prometheus.

### 3. Vérifier les targets dans Prometheus

1. Aller sur http://localhost:9090/targets
2. Vérifier que tous les targets sont "UP" (vert)
3. Si un target est "DOWN", cliquer dessus pour voir les erreurs

### 4. Vérifier les logs Prometheus

```bash
docker-compose logs prometheus
```

Cherchez les erreurs de connexion ou de scraping.

### 5. Redémarrer Prometheus

Parfois, un redémarrage résout les problèmes de connexion :
```bash
docker-compose restart prometheus
```

## Problème : "No data" dans Error Log Summary

Si le tableau "Error Log Summary" affiche "No data", cela peut signifier :

1. **Aucune erreur n'a été enregistrée** - C'est normal si l'application fonctionne correctement !
2. **La métrique n'existe pas encore** - Si l'API Gateway vient de démarrer, il peut ne pas y avoir encore d'erreurs
3. **La requête est incorrecte** - Vérifiez dans Prometheus (http://localhost:9090) si la métrique `http_request_errors_total` existe

Pour tester si les erreurs sont enregistrées :
1. Faire une requête qui génère une erreur (par exemple, accéder à une route inexistante)
2. Vérifier dans Prometheus : `http_request_errors_total{service="api-gateway"}`
3. Le tableau devrait alors afficher les données

## Problème : Dashboards non visibles

Si les dashboards n'apparaissent pas dans Grafana :

1. **Vérifier les logs Grafana** :
```bash
docker-compose logs grafana | grep -i dashboard
```

2. **Redémarrer Grafana** :
```bash
docker-compose restart grafana
```

3. **Vérifier les fichiers de dashboard** :
```bash
docker-compose exec grafana ls -la /etc/grafana/provisioning/dashboards/
```

Les fichiers JSON doivent être présents.

4. **Import manuel** si nécessaire :
   - Aller dans Grafana → Dashboards → Import
   - Copier le contenu des fichiers JSON
   - Importer

## Vérifier la connexion réseau

Testez la connectivité entre les services :
```bash
# Depuis Prometheus vers API Gateway
docker-compose exec prometheus wget -O- http://api-gateway:3000/metrics

# Depuis Prometheus vers cAdvisor
docker-compose exec prometheus wget -O- http://cadvisor:8080/metrics
```

## Commandes utiles

```bash
# Voir toutes les métriques disponibles
curl http://localhost:3000/metrics

# Vérifier les targets Prometheus
curl http://localhost:9090/api/v1/targets

# Voir les métriques dans Prometheus
curl 'http://localhost:9090/api/v1/query?query=http_requests_total'

# Vérifier le statut des services
docker-compose ps

# Redémarrer tous les services de monitoring
docker-compose restart prometheus grafana cadvisor node-exporter
```


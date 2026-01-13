# Monitoring Setup avec Prometheus et Grafana

Ce répertoire contient la configuration pour le monitoring de l'application avec Prometheus et Grafana.

## Architecture

- **Prometheus**: Collecte et stocke les métriques
- **Grafana**: Visualisation des métriques via des dashboards
- **cAdvisor**: Métriques des containers Docker
- **Node Exporter**: Métriques système

## Services exposés

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3005 (admin/admin)
- **cAdvisor**: http://localhost:8080

## Métriques collectées

### API Gateway

- **http_requests_total**: Nombre total de requêtes HTTP
- **http_request_duration_seconds**: Durée des requêtes HTTP
- **http_request_errors_total**: Nombre d'erreurs HTTP
- **http_active_connections**: Nombre de connexions actives
- **http_response_size_bytes**: Taille des réponses HTTP

### Containers

- **container_cpu_usage_seconds_total**: Utilisation CPU des containers
- **container_memory_usage_bytes**: Utilisation mémoire des containers
- **container_network_receive_bytes_total**: Bytes reçus par réseau
- **container_network_transmit_bytes_total**: Bytes transmis par réseau

## Démarrage

Les services sont automatiquement démarrés avec `docker-compose up`. Ils sont configurés pour démarrer après les autres services.

## Dashboards Grafana

Deux dashboards sont provisionnés automatiquement :

1. **API Gateway Monitoring**: Métriques spécifiques à l'API Gateway
2. **Containers Monitoring**: Métriques des containers Docker

Pour accéder aux dashboards :
1. Connectez-vous à Grafana : http://localhost:3005
2. Identifiants par défaut : admin / admin
3. Les dashboards sont disponibles dans le menu "Dashboards"

## Configuration

### Prometheus

Le fichier de configuration se trouve dans `monitoring/prometheus/prometheus.yml`.

Il configure :
- L'intervalle de scraping (15 secondes par défaut)
- Les cibles à scraper (API Gateway, cAdvisor, Node Exporter)

### Grafana

Les datasources et dashboards sont provisionnés automatiquement via :
- `monitoring/grafana/provisioning/datasources/prometheus.yml`
- `monitoring/grafana/provisioning/dashboards/dashboards.yml`

## Endpoint de métriques

L'API Gateway expose les métriques sur : `http://api-gateway:3000/metrics`

## Logs d'erreur

Les erreurs sont trackées via la métrique `http_request_errors_total` avec les labels :
- `method`: Méthode HTTP (GET, POST, etc.)
- `route`: Route de l'endpoint
- `status_code`: Code de statut HTTP
- `service`: Nom du service (api-gateway)
- `error_type`: Type d'erreur (server_error, client_error)

Ces métriques sont visibles dans le dashboard "API Gateway Monitoring" dans la section "Error Log Summary".


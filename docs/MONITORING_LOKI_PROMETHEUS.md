# Monitoring avec Loki, Prometheus et Grafana

## Architecture

```
Microservices → Promtail → Loki → Grafana
              → Prometheus → Grafana
```

## Composants

### 1. Loki - Stockage des Logs

Loki est un système de logs agrégés qui indexe uniquement les labels (métadonnées), pas le contenu des logs.

**Avantages** :
- ✅ Très léger
- ✅ Intégration native avec Grafana
- ✅ Requêtes rapides avec LogQL

### 2. Promtail - Collecteur de Logs

Promtail collecte les logs de tous les pods Kubernetes et les envoie à Loki.

### 3. Prometheus - Métriques

Prometheus collecte et stocke les métriques système et applicatives.

### 4. Grafana - Visualisation

Grafana visualise les logs (Loki) et métriques (Prometheus).

## Déploiement

```bash
./k8s/local/scripts/deploy-loki-stack.sh
```

## Accès

```bash
# Tous les dashboards
./k8s/local/scripts/access-all-dashboards.sh

# Grafana uniquement
./k8s/local/scripts/access-grafana-loki.sh

# Prometheus uniquement
./k8s/local/scripts/access-prometheus.sh
```

## Documentation

- `docs/LOKI_PROMETHEUS_GRAFANA.md` - Guide complet
- `docs/VISUALIZE_LOGS_GRAFANA_PROMETHEUS.md` - Guide de visualisation


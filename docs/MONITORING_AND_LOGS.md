# Guide de Monitoring et Logs

## Stack de Monitoring

Le projet utilise **Loki + Prometheus + Grafana** pour le monitoring des logs et métriques.

### Architecture

```
Microservices → Promtail → Loki → Grafana
              → Prometheus → Grafana
```

## Composants

### 1. Loki - Stockage des Logs

- **Rôle** : Stocke les logs indexés par labels
- **Port** : 3100
- **Namespace** : `monitoring`

### 2. Promtail - Collecteur de Logs

- **Rôle** : Collecte les logs de tous les pods
- **Type** : DaemonSet
- **Namespace** : `monitoring`

### 3. Prometheus - Métriques

- **Rôle** : Collecte et stocke les métriques
- **Port** : 9090
- **Namespace** : `monitoring`

### 4. Grafana - Visualisation

- **Rôle** : Visualise les logs et métriques
- **Port** : 3000
- **Namespace** : `monitoring`
- **Credentials** : admin/admin

## Déploiement

### Déployer la Stack

```bash
./k8s/local/scripts/deploy-loki-stack.sh
```

### Vérifier le Déploiement

```bash
kubectl get pods -n monitoring
```

Devrait afficher :
- `loki-0`
- `prometheus-0`
- `grafana-xxx`
- `promtail-xxx` (un par nœud)

## Accès aux Dashboards

### Option 1 : Tous les Dashboards

```bash
./k8s/local/scripts/access-all-dashboards.sh
```

### Option 2 : Individuellement

```bash
# Grafana
./k8s/local/scripts/access-grafana-loki.sh
# Puis: http://localhost:3000 (admin/admin)

# Prometheus
./k8s/local/scripts/access-prometheus.sh
# Puis: http://localhost:9090
```

## Visualisation des Logs

### Dans Grafana

1. Se connecter : http://localhost:3000
2. Aller dans **Dashboards > Browse**
3. Dashboards disponibles :
   - **Logs Overview - Microservices**
   - **Error Logs**
   - **Logs Rate by Service**
   - **Error Rate by Service**

### Requêtes LogQL Utiles

```logql
# Tous les logs
{namespace="intelectgame"}

# Logs d'un service
{namespace="intelectgame", app="auth-service"}

# Logs d'erreur
{namespace="intelectgame", log_level="error"}

# Taux d'erreurs par service
sum(rate({namespace="intelectgame", log_level="error"}[5m])) by (app)
```

## Visualisation des Métriques

### Dans Prometheus

1. Accéder : http://localhost:9090
2. Utiliser PromQL pour interroger les métriques

### Requêtes PromQL Utiles

```promql
# CPU usage
container_cpu_usage_seconds_total{namespace="intelectgame"}

# Memory usage
container_memory_usage_bytes{namespace="intelectgame"}

# Par service
avg(rate(container_cpu_usage_seconds_total{namespace="intelectgame"}[5m])) by (app)
```

### Dans Grafana

1. Créer un dashboard : **Dashboards > New Dashboard**
2. Ajouter un panel avec datasource **Prometheus**
3. Utiliser PromQL pour les requêtes

## Détection des Erreurs

### Dans Grafana (Loki)

Créer un panel avec :
```logql
{namespace="intelectgame", log_level="error"}
```

### Alertes

Configurer des alertes dans Grafana basées sur :
- Taux d'erreurs élevé
- Logs contenant des mots-clés spécifiques
- Métriques dépassant des seuils

## Scripts Utiles

- `./k8s/local/scripts/deploy-loki-stack.sh` - Déployer la stack
- `./k8s/local/scripts/access-all-dashboards.sh` - Accéder à tous les dashboards
- `./k8s/local/scripts/access-grafana-loki.sh` - Accéder à Grafana
- `./k8s/local/scripts/access-prometheus.sh` - Accéder à Prometheus
- `./k8s/local/scripts/verify-monitoring.sh` - Vérifier le monitoring

## Documentation

- `docs/LOKI_PROMETHEUS_GRAFANA.md` - Guide complet de la stack
- `docs/VISUALIZE_LOGS_GRAFANA_PROMETHEUS.md` - Guide de visualisation
- `docs/MONITORING_LOKI_PROMETHEUS.md` - Vue d'ensemble

## Dépannage

### Les logs n'apparaissent pas

1. Vérifier Promtail :
   ```bash
   kubectl logs -n monitoring -l app=promtail --tail=20
   ```

2. Vérifier Loki :
   ```bash
   kubectl logs -n monitoring -l app=loki --tail=20
   ```

3. Tester Loki :
   ```bash
   kubectl port-forward -n monitoring service/loki 3100:3100 &
   curl "http://localhost:3100/loki/api/v1/labels"
   ```

### Grafana ne se connecte pas à Loki

1. Vérifier la datasource :
   - Configuration > Data Sources > Loki
   - URL: `http://loki.monitoring.svc.cluster.local:3100`
   - Cliquer sur "Save & Test"

### Prometheus ne collecte pas de métriques

1. Vérifier les targets :
   - http://localhost:9090/targets
   - Vérifier que les targets sont **UP**

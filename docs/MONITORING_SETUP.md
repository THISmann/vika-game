# Configuration du Monitoring avec Loki et Prometheus

## Architecture

```
Pods Kubernetes (tous les microservices)
    ↓
Promtail (DaemonSet - collecte les logs de tous les pods)
    ↓
Loki (stocke les logs)
    ↓
Grafana (visualise les logs et métriques)
```

## Composants Déployés

### 1. Promtail (Collection de Logs)

**Rôle** : Collecte les logs de tous les pods Kubernetes

**Configuration** :
- DaemonSet déployé sur tous les nœuds
- Collecte depuis `/var/log/pods/` (logs Kubernetes)
- Enrichit avec les métadonnées Kubernetes (namespace, pod, service)
- Détecte automatiquement les erreurs (stderr ou mots-clés)
- Envoie vers Loki

**Services monitorés** :
- `auth-service`
- `quiz-service`
- `game-service`
- `frontend`
- `telegram-bot`
- `nginx-proxy` (API Gateway)

### 2. Prometheus (Métriques Système)

**Rôle** : Collecte les métriques système et Kubernetes

**Configuration** :
- Modules activés :
  - `system` : CPU, mémoire, réseau, processus
  - `docker` : Métriques des conteneurs
  - `kubernetes` : Métriques Kubernetes (pods, nodes, deployments)
- Envoie directement vers Prometheus

### 3. Loki (Traitement des Logs)

**Améliorations** :
- Détection automatique des erreurs dans les messages
- Extraction des codes de statut HTTP
- Tagging des erreurs (`error`, `http_error`, `alert`)
- Enrichissement avec les métadonnées Kubernetes

### 4. Grafana Dashboards

**Dashboards créés** :
- **Error Monitoring** : Visualisation des erreurs par service
- **System Metrics** : Métriques système (CPU, mémoire)

## Déploiement

### 1. Déployer Loki Stack

```bash
helm upgrade --install loki-stack ./k8s/local/helm/loki-stack -n monitoring --create-namespace
```

### 2. Vérifier le déploiement

```bash
# Vérifier Promtail
kubectl get pods -n monitoring -l app=promtail
kubectl logs -n monitoring -l app=promtail --tail=20

# Vérifier Loki
kubectl get pods -n monitoring -l app=loki
kubectl logs -n monitoring -l app=loki --tail=20

# Vérifier Prometheus
kubectl get pods -n monitoring -l app=prometheus
kubectl logs -n monitoring -l app=prometheus --tail=20
```

### 3. Vérifier que les logs sont collectés

```bash
# Via port-forward Loki
kubectl port-forward -n monitoring service/loki 3100:3100 &

# Vérifier les labels
curl http://localhost:3100/loki/api/v1/labels

# Vérifier les logs
curl "http://localhost:3100/loki/api/v1/query_range?query={namespace=\"intelectgame\"}&limit=10"
```

### 4. Accéder à Grafana

```bash
./k8s/local/scripts/access-grafana-loki.sh
```

Les dashboards sont automatiquement chargés.

## Visualisation dans Grafana

### Dashboard "Error Monitoring"

**Panels** :
1. **Errors by Service** : Graphique des erreurs par service
2. **Error Logs Table** : Table des logs d'erreur avec détails
3. **HTTP Errors** : Graphique des erreurs HTTP (4xx, 5xx)
4. **Logs by Service** : Répartition des logs par service

### Requêtes LogQL Utiles

#### Tous les logs d'erreur

```logql
{namespace="intelectgame", log_level="error"}
```

#### Erreurs par service

```logql
{namespace="intelectgame", app="auth-service", log_level="error"}
```

#### Erreurs HTTP

```logql
{namespace="intelectgame", log_level="error"} |= "HTTP"
```

#### Logs d'un service spécifique

```logql
{namespace="intelectgame", app="nginx-proxy"}
```

## Détection Automatique des Erreurs

Promtail détecte automatiquement :
- Mots-clés : `error`, `exception`, `failed`, `failure`, `fatal`, `critical`
- Codes HTTP d'erreur : 4xx, 5xx
- Tags ajoutés : `error`, `http_error`, `alert`

## Vérification

### 1. Vérifier que Promtail collecte les logs

```bash
kubectl logs -n monitoring -l app=promtail --tail=50 | grep -i "kubernetes\|pod\|container"
```

### 2. Vérifier que Loki reçoit les logs

```bash
kubectl logs -n monitoring -l app=loki --tail=50 | grep -i "received\|push"
```

### 3. Générer un Log de Test

```bash
# Dans un pod de votre application
kubectl exec -it -n intelectgame <pod-name> -- sh -c 'echo "ERROR: Test error message" >> /proc/1/fd/1'

# Attendre 10-20 secondes, puis vérifier dans Loki
kubectl port-forward -n monitoring service/loki 3100:3100 &
curl "http://localhost:3100/loki/api/v1/query_range?query={namespace=\"intelectgame\"}&query=Test%20error%20message&limit=10"
```

## Dépannage

### Promtail ne collecte pas les logs

1. Vérifier les permissions :
   ```bash
   kubectl describe pod -n monitoring -l app=promtail | grep -A 5 "Security Context"
   ```

2. Vérifier que les volumes sont montés :
   ```bash
   kubectl describe pod -n monitoring -l app=promtail | grep -A 5 "Mounts"
   ```

3. Vérifier les logs Promtail :
   ```bash
   kubectl logs -n monitoring -l app=promtail --tail=50
   ```

### Loki ne reçoit pas les logs

1. Vérifier que Loki écoute :
   ```bash
   kubectl exec -n monitoring -it $(kubectl get pods -n monitoring -l app=loki -o name | head -1 | cut -d/ -f2) -- \
     netstat -tlnp | grep 3100
   ```

2. Vérifier la connexion depuis Promtail :
   ```bash
   kubectl logs -n monitoring -l app=promtail --tail=50 | grep -i "loki\|connection"
   ```

### Les dashboards Grafana ne s'affichent pas

1. Vérifier que le ConfigMap est monté :
   ```bash
   kubectl describe pod -n monitoring -l app=grafana | grep -A 5 "dashboards"
   ```

2. Redémarrer Grafana :
   ```bash
   kubectl rollout restart deployment/grafana -n monitoring
   ```

## Scripts Utiles

- `./k8s/local/scripts/verify-logs-pipeline.sh` - Vérifier le pipeline de logs
- `./k8s/local/scripts/access-grafana-loki.sh` - Accéder à Grafana
- `./k8s/local/scripts/access-prometheus.sh` - Accéder à Prometheus
- `./k8s/local/scripts/deploy-loki-stack.sh` - Déployer la stack

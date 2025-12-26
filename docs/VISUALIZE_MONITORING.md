# Guide de Visualisation du Monitoring

## Vérification Rapide

### Script automatique

```bash
./k8s/local/scripts/verify-monitoring.sh
```

Ce script vérifie :
- ✅ État de Promtail, Loki, Prometheus, Grafana
- ✅ Logs collectés
- ✅ Pods monitorés

## Accéder à Grafana

### Option 1 : Script automatique

```bash
./k8s/local/scripts/access-grafana-loki.sh
```

### Option 2 : Port-forward manuel

```bash
kubectl port-forward -n monitoring service/grafana 3000:3000
```

Puis ouvrir : **http://localhost:3000**

**Credentials** :
- Username: `admin`
- Password: `admin`

## Visualiser les Logs dans Grafana

### 1. Accéder aux Dashboards

1. Se connecter à Grafana
2. Aller dans **Dashboards** (menu de gauche)
3. Les dashboards suivants sont disponibles :
   - **Logs Overview - Microservices** : Visualisation des logs
   - **Error Logs** : Logs d'erreur filtrés

### 2. Créer une Requête Personnalisée

1. Aller dans **Dashboards > New Dashboard**
2. Cliquer sur **Add visualization**
3. Sélectionner la datasource **Loki**
4. Utiliser les requêtes suivantes :

#### Tous les logs d'erreur

```logql
{namespace="intelectgame", log_level="error"}
```

#### Erreurs par service (ex: auth-service)

```logql
{namespace="intelectgame", app="auth-service", log_level="error"}
```

#### Tous les logs d'un service

```logql
{namespace="intelectgame", app="nginx-proxy"}
```

#### Erreurs HTTP (4xx, 5xx)

```logql
{namespace="intelectgame", log_level="error"} |= "HTTP"
```

#### Logs avec un mot-clé spécifique

```logql
{namespace="intelectgame"} |= "redis"
```

### 3. Visualisations Utiles

#### Graphique des Erreurs par Service

1. **Visualization** : Graph
2. **Query** : `sum(rate({namespace="intelectgame", log_level="error"}[5m])) by (app)`
3. **Legend** : `{{app}}`
4. **Time field** : `@timestamp`

#### Table des Logs d'Erreur

1. **Visualization** : Table
2. **Query** : `{namespace="intelectgame", log_level="error"}`
3. **Columns** :
   - `Time` : Timestamp
   - `app` : Service
   - `pod` : Pod
   - `message` : Message

#### Heatmap des Erreurs

1. **Visualization** : Heatmap
2. **Query** : `sum(rate({namespace="intelectgame", log_level="error"}[5m])) by (app)`

## Vérifier les Données dans Loki

### 1. Accéder à Loki

```bash
kubectl port-forward -n monitoring service/loki 3100:3100 &
```

### 2. Lister les Labels

```bash
curl http://localhost:3100/loki/api/v1/labels
```

Devrait afficher les labels disponibles (namespace, app, pod, etc.)

### 3. Rechercher des Logs

```bash
# Tous les logs d'erreur
curl "http://localhost:3100/loki/api/v1/query_range?query={namespace=\"intelectgame\",log_level=\"error\"}&limit=10"

# Logs d'un service spécifique
curl "http://localhost:3100/loki/api/v1/query_range?query={namespace=\"intelectgame\",app=\"auth-service\"}&limit=10"
```

## Vérifier que les Logs sont Collectés

### 1. Vérifier Promtail

```bash
# Logs Promtail
kubectl logs -n monitoring -l app=promtail --tail=50

# Devrait afficher des messages sur la collecte de logs
```

### 2. Générer un Log de Test

```bash
# Dans un pod de votre application
kubectl exec -it -n intelectgame <pod-name> -- sh -c 'echo "ERROR: Test error message $(date)" >> /proc/1/fd/1'

# Attendre 10-20 secondes, puis vérifier dans Loki
curl "http://localhost:3100/loki/api/v1/query_range?query={namespace=\"intelectgame\"}&query=Test%20error%20message&limit=10"
```

## Dashboards Grafana Recommandés

### Dashboard 1 : Vue d'Ensemble des Erreurs

**Panels** :
1. **Total Errors** : Nombre total d'erreurs (stat)
2. **Errors by Service** : Graphique des erreurs par service
3. **Recent Errors** : Table des erreurs récentes
4. **Error Rate** : Taux d'erreur par minute

**Query principale** :
```logql
{namespace="intelectgame", log_level="error"}
```

### Dashboard 2 : Monitoring par Service

**Panels** :
1. **Auth Service Logs** : `{namespace="intelectgame", app="auth-service"}`
2. **Quiz Service Logs** : `{namespace="intelectgame", app="quiz-service"}`
3. **Game Service Logs** : `{namespace="intelectgame", app="game-service"}`
4. **Nginx Proxy Logs** : `{namespace="intelectgame", app="nginx-proxy"}`

### Dashboard 3 : Métriques Système

**Panels** :
1. **CPU Usage** : Utilisation CPU par pod (Prometheus)
2. **Memory Usage** : Utilisation mémoire par pod (Prometheus)
3. **Network Traffic** : Trafic réseau (Prometheus)
4. **Pod Status** : État des pods (Prometheus)

## Commandes Utiles

### Voir les logs en temps réel

```bash
# Promtail
kubectl logs -f -n monitoring -l app=promtail

# Loki
kubectl logs -f -n monitoring -l app=loki

# Un service spécifique
kubectl logs -f -n intelectgame -l app=auth-service
```

### Rechercher des erreurs dans les logs

```bash
# Erreurs dans Promtail
kubectl logs -n monitoring -l app=promtail | grep -i error

# Erreurs dans Loki
kubectl logs -n monitoring -l app=loki | grep -i error
```

## Dépannage

### Aucun log n'apparaît dans Loki

1. Vérifier que Promtail collecte :
   ```bash
   kubectl logs -n monitoring -l app=promtail --tail=50
   ```

2. Vérifier que Loki reçoit les logs :
   ```bash
   kubectl logs -n monitoring -l app=loki --tail=50
   ```

3. Vérifier les labels disponibles :
   ```bash
   kubectl port-forward -n monitoring service/loki 3100:3100 &
   curl http://localhost:3100/loki/api/v1/labels
   ```

### Grafana ne montre pas de données

1. Vérifier la datasource Loki :
   - Configuration > Data Sources > Loki
   - Cliquer sur "Save & Test"

2. Vérifier que les données existent :
   ```bash
   kubectl port-forward -n monitoring service/loki 3100:3100 &
   curl "http://localhost:3100/loki/api/v1/query_range?query={namespace=\"intelectgame\"}&limit=10"
   ```

## Résumé des URLs

- **Grafana** : http://localhost:3000 (via port-forward)
- **Prometheus** : http://localhost:9090 (via port-forward)
- **Loki** : http://localhost:3100 (via port-forward)

## Scripts Disponibles

- `./k8s/local/scripts/verify-monitoring.sh` - Vérifier le monitoring
- `./k8s/local/scripts/access-grafana-loki.sh` - Accéder à Grafana
- `./k8s/local/scripts/access-prometheus.sh` - Accéder à Prometheus
- `./k8s/local/scripts/verify-logs-pipeline.sh` - Vérifier le pipeline de logs

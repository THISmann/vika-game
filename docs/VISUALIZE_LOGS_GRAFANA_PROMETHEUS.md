# Visualiser les Logs avec Grafana et Prometheus

## Accès Rapide

### Option 1 : Tous les dashboards en une commande

```bash
./k8s/local/scripts/access-all-dashboards.sh
```

Cela lance Grafana et Prometheus en arrière-plan.

### Option 2 : Individuellement

```bash
# Grafana
./k8s/local/scripts/access-grafana-loki.sh

# Prometheus (dans un autre terminal)
./k8s/local/scripts/access-prometheus.sh
```

## URLs

Une fois les port-forwards actifs :

- **Grafana** : http://localhost:3000
  - Username: `admin`
  - Password: `admin`

- **Prometheus** : http://localhost:9090
  - Pas d'authentification (environnement local)

## Visualiser les Logs dans Grafana

### 1. Accéder à Grafana

```bash
./k8s/local/scripts/access-grafana-loki.sh
```

Puis ouvrir : http://localhost:3000

### 2. Dashboards Pré-configurés

Une fois connecté, allez dans **Dashboards > Browse** :

- **Logs Overview - Microservices** : Vue d'ensemble des logs
- **Error Logs** : Logs d'erreur filtrés
- **Logs Rate by Service** : Taux de logs par service
- **Error Rate by Service** : Taux d'erreurs par service

### 3. Créer une Requête Personnalisée

1. Aller dans **Dashboards > New Dashboard**
2. Cliquer sur **Add visualization**
3. Sélectionner la datasource **Loki**
4. Utiliser LogQL pour interroger les logs

#### Requêtes LogQL Utiles

```logql
# Tous les logs du namespace intelectgame
{namespace="intelectgame"}

# Logs d'un service spécifique
{namespace="intelectgame", app="auth-service"}

# Logs d'erreur
{namespace="intelectgame", log_level="error"}

# Logs contenant un mot-clé
{namespace="intelectgame"} |= "redis"

# Combinaison
{namespace="intelectgame", app="auth-service"} |= "error"

# Taux de logs par service
sum(rate({namespace="intelectgame"}[5m])) by (app)

# Taux d'erreurs par service
sum(rate({namespace="intelectgame", log_level="error"}[5m])) by (app)
```

### 4. Visualisations Recommandées

#### Panel 1 : Logs en Temps Réel

- **Type** : Logs
- **Query** : `{namespace="intelectgame"}`
- **Options** :
  - Show time: Yes
  - Wrap log message: Yes
  - Deduplication: None

#### Panel 2 : Erreurs par Service

- **Type** : Graph
- **Query** : `sum(rate({namespace="intelectgame", log_level="error"}[5m])) by (app)`
- **Legend** : `{{app}}`

#### Panel 3 : Table des Erreurs

- **Type** : Table
- **Query** : `{namespace="intelectgame", log_level="error"}`
- **Columns** :
  - Time: `@timestamp`
  - Service: `app`
  - Pod: `pod`
  - Message: `message`

## Visualiser les Métriques dans Prometheus

### 1. Accéder à Prometheus

```bash
./k8s/local/scripts/access-prometheus.sh
```

Puis ouvrir : http://localhost:9090

### 2. Requêtes PromQL

Dans l'onglet **Graph**, vous pouvez exécuter des requêtes PromQL :

#### Métriques Système

```promql
# CPU usage par pod
container_cpu_usage_seconds_total{namespace="intelectgame"}

# Memory usage par pod
container_memory_usage_bytes{namespace="intelectgame"}

# CPU usage moyen par service
avg(container_cpu_usage_seconds_total{namespace="intelectgame"}) by (app)

# Memory usage total par service
sum(container_memory_usage_bytes{namespace="intelectgame"}) by (app)
```

#### Taux et Agrégations

```promql
# Taux de CPU
rate(container_cpu_usage_seconds_total{namespace="intelectgame"}[5m])

# Taux de mémoire
rate(container_memory_usage_bytes{namespace="intelectgame"}[5m])

# CPU usage par service (moyenne)
avg(rate(container_cpu_usage_seconds_total{namespace="intelectgame"}[5m])) by (app)
```

### 3. Vérifier les Targets

1. Aller dans **Status > Targets**
2. Vérifier que tous les endpoints sont **UP**
3. Les targets incluent :
   - `kubernetes-nodes` : Métriques des nœuds
   - `kubernetes-pods` : Métriques des pods
   - `kubernetes-services` : Métriques des services

## Visualiser les Métriques dans Grafana

### 1. Créer un Dashboard Métriques

1. Aller dans **Dashboards > New Dashboard**
2. Cliquer sur **Add visualization**
3. Sélectionner la datasource **Prometheus**
4. Utiliser PromQL pour interroger les métriques

### 2. Panels Recommandés

#### Panel 1 : CPU Usage par Service

- **Type** : Graph
- **Query** : `avg(rate(container_cpu_usage_seconds_total{namespace="intelectgame"}[5m])) by (app)`
- **Legend** : `{{app}}`

#### Panel 2 : Memory Usage par Service

- **Type** : Graph
- **Query** : `sum(container_memory_usage_bytes{namespace="intelectgame"}) by (app)`
- **Legend** : `{{app}}`
- **Unit** : bytes

#### Panel 3 : Network I/O

- **Type** : Graph
- **Query** : `rate(container_network_receive_bytes_total{namespace="intelectgame"}[5m])`
- **Legend** : Receive
- **Query 2** : `rate(container_network_transmit_bytes_total{namespace="intelectgame"}[5m])`
- **Legend** : Transmit

## Dashboard Complet : Logs + Métriques

### Créer un Dashboard Mixte

1. **Panel 1** : Logs en temps réel (Loki)
   - Query: `{namespace="intelectgame"}`

2. **Panel 2** : Erreurs par service (Loki)
   - Query: `sum(rate({namespace="intelectgame", log_level="error"}[5m])) by (app)`

3. **Panel 3** : CPU usage (Prometheus)
   - Query: `avg(rate(container_cpu_usage_seconds_total{namespace="intelectgame"}[5m])) by (app)`

4. **Panel 4** : Memory usage (Prometheus)
   - Query: `sum(container_memory_usage_bytes{namespace="intelectgame"}) by (app)`

## Détecter les Erreurs

### Dans Grafana (Loki)

1. Créer un panel avec la requête :
   ```logql
   {namespace="intelectgame", log_level="error"}
   ```

2. Ajouter une alerte si le taux d'erreurs dépasse un seuil :
   ```logql
   sum(rate({namespace="intelectgame", log_level="error"}[5m])) > 0.1
   ```

### Dans Prometheus

1. Créer une règle d'alerte dans Prometheus
2. Configurer Grafana pour recevoir les alertes

## Commandes Utiles

### Vérifier les Port-Forwards

```bash
# Vérifier Grafana
ps aux | grep "kubectl port-forward.*grafana.*3000" | grep -v grep

# Vérifier Prometheus
ps aux | grep "kubectl port-forward.*prometheus.*9090" | grep -v grep
```

### Arrêter les Port-Forwards

```bash
# Arrêter Grafana
pkill -f "kubectl port-forward.*grafana"

# Arrêter Prometheus
pkill -f "kubectl port-forward.*prometheus"

# Arrêter tous
pkill -f "kubectl port-forward"
```

### Voir les Logs des Port-Forwards

```bash
# Grafana
tail -f /tmp/grafana-port-forward.log

# Prometheus
tail -f /tmp/prometheus-port-forward.log
```

## Dépannage

### Grafana ne se connecte pas à Loki

1. Vérifier que Loki est démarré :
   ```bash
   kubectl get pods -n monitoring -l app=loki
   ```

2. Vérifier la datasource dans Grafana :
   - Configuration > Data Sources > Loki
   - URL: `http://loki.monitoring.svc.cluster.local:3100`
   - Cliquer sur "Save & Test"

### Prometheus ne collecte pas de métriques

1. Vérifier les targets :
   - http://localhost:9090/targets
   - Vérifier que les targets sont **UP**

2. Vérifier la configuration :
   - http://localhost:9090/config
   - Vérifier les `scrape_configs`

### Aucun log n'apparaît

1. Vérifier que Promtail collecte :
   ```bash
   kubectl logs -n monitoring -l app=promtail --tail=20
   ```

2. Vérifier que Loki reçoit les logs :
   ```bash
   kubectl logs -n monitoring -l app=loki --tail=20
   ```

3. Tester une requête dans Loki :
   ```bash
   kubectl port-forward -n monitoring service/loki 3100:3100 &
   curl "http://localhost:3100/loki/api/v1/labels"
   ```

## Scripts Disponibles

- `./k8s/local/scripts/access-all-dashboards.sh` - Lancer tous les dashboards
- `./k8s/local/scripts/access-grafana-loki.sh` - Accéder à Grafana
- `./k8s/local/scripts/access-prometheus.sh` - Accéder à Prometheus
- `./k8s/local/scripts/deploy-loki-stack.sh` - Déployer la stack

## Résumé

1. **Lancer les dashboards** : `./k8s/local/scripts/access-all-dashboards.sh`
2. **Grafana** : http://localhost:3000 (admin/admin)
3. **Prometheus** : http://localhost:9090
4. **Visualiser les logs** : Utiliser LogQL dans Grafana
5. **Visualiser les métriques** : Utiliser PromQL dans Grafana ou Prometheus


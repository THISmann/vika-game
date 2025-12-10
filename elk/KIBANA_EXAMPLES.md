# 📊 Exemples de requêtes et visualisations Kibana

Exemples concrets de requêtes KQL et configurations de visualisations pour GameV2.

## 🔍 Requêtes KQL pour Discover

### Logs des endpoints critiques

```kql
critical_endpoint: true
```

### Erreurs sur les endpoints critiques

```kql
critical_endpoint: true AND log_level: "error"
```

### Réponses des joueurs avec détails

```kql
endpoint_type: "answer" AND container_name: "game-service"
```

### Erreurs WebSocket

```kql
endpoint_type: "websocket" AND log_level: "error"
```

### Temps de réponse élevé (> 1 seconde)

```kql
has_performance_metric: true AND response_time > 1000
```

### Rechercher un joueur spécifique

```kql
player_id: "p1234567890" OR player_name: "John"
```

### Rechercher une question spécifique

```kql
question_id: "q1764929000053"
```

### Logs des dernières 15 minutes

```kql
@timestamp >= now()-15m
```

### Logs d'un service spécifique avec erreurs

```kql
container_name: "game-service" AND log_level: "error" AND @timestamp >= now()-1h
```

### Réponses correctes vs incorrectes

```kql
endpoint_type: "answer" AND (is_correct: "true" OR is_correct: "false")
```

---

## 📈 Configurations de visualisations

### 1. Graphique des requêtes par endpoint (Line Chart)

**Configuration** :
- **Metrics** :
  - Y-axis: `Count`
- **Buckets** :
  - X-axis: `Date Histogram`
    - Field: `@timestamp`
    - Interval: `Auto`
  - Split series: `Terms`
    - Field: `endpoint_type.keyword`
    - Order by: `Metric: Count`
    - Order: `Descending`
    - Size: `10`
- **Filters** :
  - `critical_endpoint: true`

### 2. Taux d'erreur par service (Pie Chart)

**Configuration** :
- **Metrics** :
  - Slice size: `Count`
- **Buckets** :
  - Split slices: `Terms`
    - Field: `container_name.keyword`
    - Order by: `Metric: Count`
    - Order: `Descending`
    - Size: `10`
- **Filters** :
  - `log_level: "error"`

### 3. Top 10 des erreurs (Data Table)

**Configuration** :
- **Metrics** :
  - Metric: `Count`
- **Buckets** :
  - Split rows: `Terms`
    - Field: `message.keyword`
    - Order by: `Metric: Count`
    - Order: `Descending`
    - Size: `10`
- **Filters** :
  - `log_level: "error"`

### 4. Temps de réponse moyen (Line Chart)

**Configuration** :
- **Metrics** :
  - Y-axis: `Average`
    - Field: `response_time`
- **Buckets** :
  - X-axis: `Date Histogram`
    - Field: `@timestamp`
    - Interval: `Auto`
- **Filters** :
  - `has_performance_metric: true`

### 5. Nombre de réponses par joueur (Vertical Bar)

**Configuration** :
- **Metrics** :
  - Y-axis: `Count`
- **Buckets** :
  - X-axis: `Terms`
    - Field: `player_name.keyword`
    - Order by: `Metric: Count`
    - Order: `Descending`
    - Size: `20`
- **Filters** :
  - `endpoint_type: "answer"`

### 6. Taux de succès des endpoints (Gauge)

**Configuration** :
- **Metrics** :
  - Gauge: `Ratio`
    - Numerator: `Count` avec filtre `http_status: [200 TO 299]`
    - Denominator: `Count` (total)
- **Filters** :
  - `critical_endpoint: true`

### 7. Événements WebSocket (Timeline)

**Configuration** :
- **Metrics** :
  - Value: `Count`
- **Buckets** :
  - Event distribution: `Terms`
    - Field: `event_name.keyword`
    - Order by: `Metric: Count`
    - Order: `Descending`
  - Time: `Date Histogram`
    - Field: `@timestamp`
    - Interval: `Auto`
- **Index** : `gamev2-websocket-*`

### 8. Latence p95 (Line Chart)

**Configuration** :
- **Metrics** :
  - Y-axis: `Percentile`
    - Field: `response_time`
    - Percentile: `95`
- **Buckets** :
  - X-axis: `Date Histogram`
    - Field: `@timestamp`
    - Interval: `Auto`
- **Filters** :
  - `has_performance_metric: true`

### 9. Throughput (Metric)

**Configuration** :
- **Metrics** :
  - Metric: `Count` par minute
- **Filters** :
  - `critical_endpoint: true`

### 10. Taux de réponses correctes (Gauge)

**Configuration** :
- **Metrics** :
  - Gauge: `Ratio`
    - Numerator: `Count` avec filtre `is_correct: "true"`
    - Denominator: `Count` (total)
- **Filters** :
  - `endpoint_type: "answer"`

---

## 📊 Exemples de dashboards

### Dashboard "Monitoring Complet"

**Visualisations** :
1. Graphique des requêtes (Line) - Toutes les requêtes
2. Taux d'erreur (Gauge) - Pourcentage d'erreurs
3. Top erreurs (Data table) - Les 10 erreurs les plus fréquentes
4. Performance (Line) - Temps de réponse moyen
5. Services (Pie) - Répartition par service
6. WebSocket (Timeline) - Événements WebSocket

**Time picker** : Dernières 24 heures

### Dashboard "Performance"

**Visualisations** :
1. Temps de réponse moyen (Line)
2. Latence p95 (Line)
3. Throughput (Metric)
4. Erreurs par minute (Line)
5. Top endpoints lents (Data table)

**Time picker** : Dernière heure

### Dashboard "Endpoints Critiques"

**Visualisations** :
1. Requêtes par endpoint (Line)
2. Taux de succès (Gauge)
3. Top 10 erreurs (Data table)
4. Temps de réponse (Line)

**Time picker** : Dernières 24 heures

---

## 🚨 Exemples d'alertes

### Alerte 1 : Trop d'erreurs

**Configuration** :
- **Name** : "Trop d'erreurs détectées"
- **Rule type** : Elasticsearch query
- **Index** : `gamev2-logs-*`
- **Query** :
  ```json
  {
    "query": {
      "bool": {
        "must": [
          { "match": { "log_level": "error" } },
          { "range": { "@timestamp": { "gte": "now-5m" } } }
        ]
      }
    }
  }
  ```
- **Condition** : `count() > 50`
- **Action** : Email ou Webhook

### Alerte 2 : Service down

**Configuration** :
- **Name** : "Service non disponible"
- **Rule type** : Elasticsearch query
- **Index** : `gamev2-logs-*`
- **Query** :
  ```json
  {
    "query": {
      "bool": {
        "must": [
          { "match": { "container_name": "game-service" } }
        ],
        "filter": {
          "range": { "@timestamp": { "gte": "now-2m" } }
        }
      }
    }
  }
  ```
- **Condition** : `count() == 0`
- **Action** : Notification

### Alerte 3 : Temps de réponse élevé

**Configuration** :
- **Name** : "Temps de réponse élevé"
- **Rule type** : Elasticsearch query
- **Index** : `gamev2-logs-*`
- **Query** :
  ```json
  {
    "query": {
      "bool": {
        "must": [
          { "exists": { "field": "response_time" } },
          { "range": { "response_time": { "gt": 5000 } } },
          { "range": { "@timestamp": { "gte": "now-10m" } } }
        ]
      }
    }
  }
  ```
- **Condition** : `count() > 10`
- **Action** : Email ou Webhook

---

## 💡 Astuces

### Utiliser les champs disponibles

Pour voir tous les champs disponibles dans vos logs :
1. Allez dans **Discover**
2. Cliquez sur un document pour voir tous les champs
3. Utilisez ces champs dans vos requêtes et visualisations

### Sauvegarder vos recherches

1. Après avoir configuré une recherche, cliquez sur **Save**
2. Donnez un nom descriptif
3. Réutilisez-la dans vos visualisations

### Partager vos dashboards

1. Dans un dashboard, cliquez sur **Share**
2. Copiez le lien ou exportez en PDF/PNG

### Auto-refresh

1. Dans un dashboard, cliquez sur **Auto-refresh**
2. Sélectionnez un intervalle (ex: 30 secondes)
3. Le dashboard se mettra à jour automatiquement

---

## 🔗 Ressources

- [Guide complet de visualisation](elk/KIBANA_VISUALIZATION_GUIDE.md)
- [Documentation Kibana](https://www.elastic.co/guide/en/kibana/current/index.html)
- [KQL Query Language](https://www.elastic.co/guide/en/kibana/current/kuery-query.html)


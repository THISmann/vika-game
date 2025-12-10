# 📊 Guide : Visualiser les logs et métriques dans Kibana

Guide étape par étape pour visualiser les logs et métriques de votre application GameV2 dans Kibana.

## 🎯 Prérequis

- Kibana accessible sur http://localhost:5601
- Elasticsearch fonctionnel
- Des logs collectés par Filebeat

## 📋 Table des matières

1. [Créer des index patterns](#1-créer-des-index-patterns)
2. [Explorer les logs (Discover)](#2-explorer-les-logs-discover)
3. [Créer des visualisations](#3-créer-des-visualisations)
4. [Créer des dashboards](#4-créer-des-dashboards)
5. [Métriques et KPIs](#5-métriques-et-kpis)
6. [Alertes](#6-alertes)

---

## 1. Créer des index patterns

Les index patterns permettent à Kibana de savoir quels indices Elasticsearch utiliser.

### Étape 1 : Accéder à la gestion des index patterns

1. Ouvrez Kibana : http://localhost:5601
2. Cliquez sur le menu hamburger (☰) en haut à gauche
3. Allez dans **Management** → **Stack Management**
4. Dans le menu de gauche, cliquez sur **Index Patterns**
5. Cliquez sur **Create index pattern**

### Étape 2 : Créer l'index pattern principal

1. **Step 1 of 2: Define index pattern**
   - Entrez : `gamev2-logs-*`
   - Cliquez sur **Next step**

2. **Step 2 of 2: Configure settings**
   - **Time field** : Sélectionnez `@timestamp`
   - Cliquez sur **Create index pattern**

### Étape 3 : Créer les autres index patterns

Répétez pour les autres indices :

- **Index pattern** : `gamev2-errors-*` → **Time field** : `@timestamp`
- **Index pattern** : `gamev2-critical-*` → **Time field** : `@timestamp`
- **Index pattern** : `gamev2-websocket-*` → **Time field** : `@timestamp`

---

## 2. Explorer les logs (Discover)

Discover permet d'explorer et de rechercher dans vos logs.

### Accéder à Discover

1. Cliquez sur le menu hamburger (☰)
2. Allez dans **Analytics** → **Discover**

### Rechercher des logs

#### Recherche simple

Dans la barre de recherche, utilisez KQL (Kibana Query Language) :

```kql
# Tous les logs
*

# Logs d'un service spécifique
container_name: "game-service"

# Logs d'erreur
log_level: "error"

# Endpoints critiques
critical_endpoint: true
```

#### Recherche avancée

```kql
# Erreurs sur les endpoints critiques
critical_endpoint: true AND log_level: "error"

# Réponses des joueurs
endpoint_type: "answer" AND container_name: "game-service"

# Erreurs WebSocket
endpoint_type: "websocket" AND log_level: "error"

# Temps de réponse élevé
has_performance_metric: true AND response_time > 1000

# Rechercher par player ID
player_id: "p1234567890"

# Rechercher par question ID
question_id: "q1764929000053"

# Logs des dernières 15 minutes
@timestamp >= now()-15m

# Combinaison complexe
container_name: "game-service" AND log_level: "error" AND @timestamp >= now()-1h
```

### Filtrer les résultats

1. Cliquez sur un champ dans la liste des champs à gauche
2. Cliquez sur **Add filter** pour ajouter un filtre
3. Utilisez les opérateurs : `is`, `is not`, `is one of`, `exists`, etc.

### Sauvegarder une recherche

1. Après avoir configuré votre recherche, cliquez sur **Save** en haut à droite
2. Donnez un nom à votre recherche (ex: "Erreurs endpoints critiques")
3. Cliquez sur **Save**

---

## 3. Créer des visualisations

Les visualisations permettent de créer des graphiques et tableaux à partir de vos logs.

### Accéder aux visualisations

1. Menu hamburger (☰) → **Analytics** → **Visualize Library**
2. Cliquez sur **Create visualization**

### Visualisation 1 : Graphique des requêtes par endpoint

**Objectif** : Voir le nombre de requêtes par endpoint critique au fil du temps

1. **Choose a visualization type** : Sélectionnez **Line**
2. **Choose a source** : Sélectionnez `gamev2-logs-*`
3. **Configure** :
   - **Metrics** :
     - **Y-axis** : `Count` (Aggregation: Count)
   - **Buckets** :
     - **X-axis** : `Date Histogram`
       - Field: `@timestamp`
       - Interval: `Auto` ou `1 minute`
     - **Split series** : `Terms`
       - Field: `endpoint_type.keyword`
       - Order by: `Metric: Count`
       - Order: `Descending`
       - Size: `10`
4. Cliquez sur **Update** pour voir le résultat
5. Cliquez sur **Save** et donnez un nom : "Requêtes par endpoint"

### Visualisation 2 : Taux d'erreur par service

**Objectif** : Voir la répartition des erreurs par service

1. **Choose a visualization type** : Sélectionnez **Pie**
2. **Choose a source** : Sélectionnez `gamev2-logs-*`
3. **Configure** :
   - **Metrics** :
     - **Slice size** : `Count` (Aggregation: Count)
   - **Buckets** :
     - **Split slices** : `Terms`
       - Field: `container_name.keyword`
       - Order by: `Metric: Count`
       - Order: `Descending`
       - Size: `10`
   - **Filters** :
     - Ajoutez un filtre : `log_level: "error"`
4. Cliquez sur **Update** puis **Save** : "Taux d'erreur par service"

### Visualisation 3 : Top 10 des erreurs

**Objectif** : Voir les 10 erreurs les plus fréquentes

1. **Choose a visualization type** : Sélectionnez **Data table**
2. **Choose a source** : Sélectionnez `gamev2-logs-*`
3. **Configure** :
   - **Metrics** :
     - **Metric** : `Count`
   - **Buckets** :
     - **Split rows** : `Terms`
       - Field: `message.keyword`
       - Order by: `Metric: Count`
       - Order: `Descending`
       - Size: `10`
   - **Filters** :
     - Ajoutez un filtre : `log_level: "error"`
4. Cliquez sur **Update** puis **Save** : "Top 10 erreurs"

### Visualisation 4 : Temps de réponse moyen

**Objectif** : Voir le temps de réponse moyen au fil du temps

1. **Choose a visualization type** : Sélectionnez **Line**
2. **Choose a source** : Sélectionnez `gamev2-logs-*`
3. **Configure** :
   - **Metrics** :
     - **Y-axis** : `Average` (Aggregation: Average, Field: `response_time`)
   - **Buckets** :
     - **X-axis** : `Date Histogram`
       - Field: `@timestamp`
       - Interval: `Auto`
   - **Filters** :
     - Ajoutez un filtre : `has_performance_metric: true`
4. Cliquez sur **Update** puis **Save** : "Temps de réponse moyen"

### Visualisation 5 : Logs WebSocket en temps réel

**Objectif** : Voir les événements WebSocket au fil du temps

1. **Choose a visualization type** : Sélectionnez **Timeline**
2. **Choose a source** : Sélectionnez `gamev2-websocket-*`
3. **Configure** :
   - **Metrics** :
     - **Value** : `Count`
   - **Buckets** :
     - **Event distribution** : `Terms`
       - Field: `event_name.keyword`
       - Order by: `Metric: Count`
       - Order: `Descending`
     - **Time** : `Date Histogram`
       - Field: `@timestamp`
       - Interval: `Auto`
4. Cliquez sur **Update** puis **Save** : "Événements WebSocket"

### Visualisation 6 : Nombre de réponses par joueur

**Objectif** : Voir combien de réponses chaque joueur a soumises

1. **Choose a visualization type** : Sélectionnez **Vertical bar**
2. **Choose a source** : Sélectionnez `gamev2-logs-*`
3. **Configure** :
   - **Metrics** :
     - **Y-axis** : `Count`
   - **Buckets** :
     - **X-axis** : `Terms`
       - Field: `player_name.keyword`
       - Order by: `Metric: Count`
       - Order: `Descending`
       - Size: `20`
   - **Filters** :
     - Ajoutez un filtre : `endpoint_type: "answer"`
4. Cliquez sur **Update** puis **Save** : "Réponses par joueur"

---

## 4. Créer des dashboards

Les dashboards combinent plusieurs visualisations sur une seule page.

### Créer un nouveau dashboard

1. Menu hamburger (☰) → **Analytics** → **Dashboards**
2. Cliquez sur **Create dashboard**
3. Cliquez sur **Add** → **Add an existing** ou **Add a new visualization**

### Dashboard "Endpoints Critiques"

Créez un dashboard avec les visualisations suivantes :

1. **Requêtes par endpoint** (Line chart)
2. **Taux d'erreur par service** (Pie chart)
3. **Top 10 des erreurs** (Data table)
4. **Temps de réponse moyen** (Line chart)

**Configuration** :
- Arrangez les visualisations en grille
- Ajustez la taille de chaque visualisation
- Configurez le time picker en haut (dernières 24 heures par défaut)

### Dashboard "Performance"

1. **Temps de réponse moyen** (Line chart)
2. **Latence p95** (Line chart - Percentile de `response_time` à 95)
3. **Throughput** (Metric - Count par minute)
4. **Erreurs par minute** (Line chart)

### Dashboard "WebSocket"

1. **Événements WebSocket** (Timeline)
2. **Connexions actives** (Metric - Count où `connected_status: "true"`)
3. **Erreurs de connexion** (Line chart - Count où `log_level: "error"`)

### Sauvegarder un dashboard

1. Cliquez sur **Save** en haut à droite
2. Donnez un nom (ex: "GameV2 - Endpoints Critiques")
3. Cliquez sur **Save**

---

## 5. Métriques et KPIs

### Métriques importantes à suivre

#### 1. Taux de succès des endpoints

**Visualisation** : Gauge
- **Query** : `critical_endpoint: true`
- **Metric** : `(count(http_status: 2*) / count(*)) * 100`
- **Objectif** : > 95%

#### 2. Nombre de requêtes par minute

**Visualisation** : Metric
- **Query** : `critical_endpoint: true`
- **Metric** : `Count` avec intervalle de 1 minute

#### 3. Temps de réponse p95

**Visualisation** : Metric
- **Query** : `has_performance_metric: true`
- **Metric** : `Percentile` de `response_time` à 95
- **Objectif** : < 1000ms

#### 4. Nombre d'erreurs par heure

**Visualisation** : Line chart
- **Query** : `log_level: "error"`
- **Metric** : `Count` avec intervalle de 1 heure

#### 5. Taux de réponses correctes

**Visualisation** : Gauge
- **Query** : `endpoint_type: "answer"`
- **Metric** : `(count(is_correct: "true") / count(*)) * 100`

---

## 6. Alertes

Les alertes permettent de recevoir des notifications lorsque certains seuils sont dépassés.

### Créer une alerte

1. Menu hamburger (☰) → **Management** → **Stack Management** → **Rules and Connectors**
2. Cliquez sur **Create rule**
3. Configurez :

#### Alerte 1 : Trop d'erreurs

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

#### Alerte 2 : Service down

- **Name** : "Service non disponible"
- **Rule type** : Elasticsearch query
- **Index** : `gamev2-logs-*`
- **Query** :
  ```json
  {
    "query": {
      "bool": {
        "must_not": [
          { "match": { "container_name": "game-service" } }
        ],
        "filter": {
          "range": { "@timestamp": { "gte": "now-2m" } }
        }
      }
    }
  }
  ```
- **Condition** : `count() == 0` (pas de logs depuis 2 minutes)
- **Action** : Notification

---

## 🔍 Requêtes KQL utiles

### Recherches courantes

```kql
# Tous les endpoints critiques
critical_endpoint: true

# Erreurs sur endpoints critiques
critical_endpoint: true AND log_level: "error"

# Réponses des joueurs
endpoint_type: "answer" AND container_name: "game-service"

# Erreurs WebSocket
endpoint_type: "websocket" AND log_level: "error"

# Temps de réponse élevé
has_performance_metric: true AND response_time > 1000

# Rechercher par player ID
player_id: "p1234567890"

# Rechercher par question ID
question_id: "q1764929000053"

# Logs des dernières 15 minutes
@timestamp >= now()-15m

# Combinaison complexe
container_name: "game-service" AND log_level: "error" AND @timestamp >= now()-1h
```

### Agrégations utiles

```kql
# Compter les erreurs par service
log_level: "error" | stats count() by container_name

# Moyenne des temps de réponse
has_performance_metric: true | stats avg(response_time) by endpoint_type

# Top 10 des joueurs par nombre de réponses
endpoint_type: "answer" | stats count() by player_name | sort count() desc | head 10
```

---

## 📊 Exemples de dashboards complets

### Dashboard "Monitoring Complet"

1. **Graphique des requêtes** (Line) - Toutes les requêtes au fil du temps
2. **Taux d'erreur** (Gauge) - Pourcentage d'erreurs
3. **Top erreurs** (Data table) - Les 10 erreurs les plus fréquentes
4. **Performance** (Line) - Temps de réponse moyen
5. **Services** (Pie) - Répartition par service
6. **WebSocket** (Timeline) - Événements WebSocket

### Dashboard "Performance"

1. **Temps de réponse moyen** (Line)
2. **Latence p95** (Line)
3. **Throughput** (Metric)
4. **Erreurs par minute** (Line)
5. **Top endpoints lents** (Data table)

---

## 🎨 Personnalisation

### Changer les couleurs

1. Dans une visualisation, cliquez sur **Options**
2. Modifiez les couleurs dans **Color mapping**

### Ajouter des annotations

1. Dans un dashboard, cliquez sur **Add annotation**
2. Ajoutez des événements importants (déploiements, incidents, etc.)

### Exporter les données

1. Dans Discover ou une visualisation, cliquez sur **Share**
2. Sélectionnez **CSV Reports** ou **PNG Reports**

---

## 📝 Conseils

1. **Time picker** : Utilisez le time picker en haut pour filtrer par période
2. **Auto-refresh** : Activez l'auto-refresh pour les dashboards en temps réel
3. **Sauvegarder** : Sauvegardez vos recherches et visualisations pour les réutiliser
4. **Filtres** : Utilisez les filtres pour affiner vos recherches
5. **Export** : Exportez vos dashboards pour les partager

---

## 🔗 Ressources

- [Documentation Kibana](https://www.elastic.co/guide/en/kibana/current/index.html)
- [KQL Query Language](https://www.elastic.co/guide/en/kibana/current/kuery-query.html)
- [Visualizations Guide](https://www.elastic.co/guide/en/kibana/current/visualize.html)


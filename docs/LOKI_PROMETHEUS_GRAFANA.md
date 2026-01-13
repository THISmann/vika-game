# Loki, Prometheus et Grafana - Guide Complet

## Vue d'Ensemble

Cette stack de monitoring (Loki + Prometheus + Grafana) est une alternative moderne à ELK pour la gestion des logs et métriques des microservices.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Microservices Pods                        │
│  (auth-service, quiz-service, game-service, frontend, etc.)  │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               │ Logs                          │ Métriques
               │                               │
       ┌───────▼────────┐              ┌───────▼────────┐
       │   Promtail     │              │  Prometheus   │
       │  (DaemonSet)   │              │ (StatefulSet) │
       │                │              │               │
       │  Collecte les  │              │  Collecte les│
       │  logs de tous  │              │  métriques   │
       │  les pods      │              │  des pods    │
       └───────┬────────┘              └───────┬───────┘
               │                               │
               │ Push                          │ Scrape
               │                               │
       ┌───────▼────────┐              ┌───────▼────────┐
       │     Loki       │              │  Prometheus   │
       │ (StatefulSet)  │              │   Storage     │
       │                │              │               │
       │  Stocke les    │              │  Stocke les  │
       │  logs          │              │  métriques   │
       └───────┬────────┘              └───────┬───────┘
               │                               │
               └───────────┬───────────────────┘
                           │
                   ┌───────▼────────┐
                   │    Grafana     │
                   │  (Deployment)  │
                   │                │
                   │  Visualise les │
                   │  logs (Loki)  │
                   │  et métriques │
                   │  (Prometheus) │
                   └────────────────┘
```

## Composants Détaillés

### 1. Loki - Système de Logs

**Qu'est-ce que Loki ?**

Loki est un système de logs agrégés inspiré de Prometheus, conçu pour être très économique et facile à utiliser. Contrairement à Elasticsearch qui indexe le contenu des logs, Loki indexe uniquement les labels (métadonnées), ce qui le rend beaucoup plus léger.

**Fonctionnement** :

1. **Réception des logs** : Loki reçoit les logs via l'API Push HTTP (`/loki/api/v1/push`)
2. **Indexation par labels** : Les logs sont indexés uniquement par leurs labels (namespace, pod, app, etc.), pas par leur contenu
3. **Stockage** : Les logs sont stockés dans des chunks sur le système de fichiers
4. **Requêtes** : Les requêtes utilisent LogQL (similaire à PromQL) pour filtrer par labels puis chercher dans le contenu

**Avantages** :
- ✅ Très léger (pas d'indexation du contenu)
- ✅ Intégration native avec Grafana
- ✅ Requêtes rapides grâce à l'indexation par labels
- ✅ Compatible avec les labels Prometheus

**Configuration** :
- Port : `3100`
- Stockage : Système de fichiers (ou S3 en production)
- Rétention : 7 jours par défaut (configurable)

### 2. Promtail - Collecteur de Logs

**Qu'est-ce que Promtail ?**

Promtail est l'agent de collecte de logs pour Loki. Il fonctionne comme un DaemonSet sur chaque nœud Kubernetes et collecte les logs de tous les pods.

**Fonctionnement** :

1. **Découverte automatique** : Utilise la découverte de services Kubernetes (`kubernetes_sd_configs`)
2. **Collecte des logs** : Lit les logs depuis `/var/log/pods/` (logs Kubernetes)
3. **Enrichissement** : Ajoute les métadonnées Kubernetes (namespace, pod, app, etc.)
4. **Pipeline de traitement** :
   - Parse les logs JSON
   - Extrait les timestamps
   - Détecte les erreurs (stderr ou mots-clés)
   - Ajoute des labels
5. **Envoi vers Loki** : Push les logs enrichis vers Loki

**Configuration** :
- Port : `3101` (métriques internes)
- Scrape configs : Configuration des jobs de collecte
- Pipeline stages : Traitement des logs (parsing, labels, etc.)

**Labels ajoutés automatiquement** :
- `namespace` : Namespace Kubernetes
- `pod` : Nom du pod
- `container` : Nom du conteneur
- `app` : Label `app` du pod
- `log_level` : Niveau de log (error, info, etc.)
- `stream` : stdout ou stderr

### 3. Prometheus - Système de Métriques

**Qu'est-ce que Prometheus ?**

Prometheus est un système de monitoring et d'alerting open-source qui collecte et stocke les métriques sous forme de séries temporelles.

**Fonctionnement** :

1. **Scraping** : Prometheus "scrape" (récupère) les métriques depuis les endpoints HTTP des services
2. **Stockage** : Les métriques sont stockées dans une base de données temporelle (TSDB)
3. **Requêtes** : Utilise PromQL pour interroger les métriques
4. **Alertes** : Peut déclencher des alertes basées sur des règles

**Types de métriques collectées** :

- **Métriques Kubernetes** :
  - CPU usage par pod
  - Memory usage par pod
  - Network I/O
  - Disk I/O
- **Métriques applicatives** (si exposées) :
  - Nombre de requêtes HTTP
  - Temps de réponse
  - Erreurs par endpoint
  - etc.

**Configuration** :
- Port : `9090`
- Scrape interval : `15s` (configurable)
- Rétention : `15 jours` (configurable)
- Service discovery : Découverte automatique des pods Kubernetes

### 4. Grafana - Visualisation

**Qu'est-ce que Grafana ?**

Grafana est une plateforme open-source pour la visualisation et l'analyse de données. Elle peut se connecter à de nombreuses sources de données (Loki, Prometheus, Elasticsearch, etc.).

**Fonctionnement** :

1. **Datasources** : Se connecte à Loki (logs) et Prometheus (métriques)
2. **Dashboards** : Crée des visualisations avec des panels
3. **Requêtes** :
   - **LogQL** pour les logs Loki
   - **PromQL** pour les métriques Prometheus
4. **Alertes** : Peut créer des alertes basées sur les données

**Dashboards fournis** :

- **Logs Overview** : Vue d'ensemble des logs par service
- **Error Logs** : Logs d'erreur filtrés
- **Logs Rate** : Taux de logs par service
- **Error Rate** : Taux d'erreurs par service

## Flux de Données Détaillé

### Flux des Logs

```
1. Application écrit dans stdout/stderr
   ↓
2. Kubernetes capture dans /var/log/pods/
   ↓
3. Promtail (DaemonSet) lit depuis /var/log/pods/
   ↓
4. Promtail enrichit avec métadonnées Kubernetes
   ↓
5. Promtail détecte les erreurs (stderr ou mots-clés)
   ↓
6. Promtail push vers Loki via HTTP POST
   ↓
7. Loki indexe par labels et stocke les logs
   ↓
8. Grafana interroge Loki avec LogQL
   ↓
9. Grafana affiche les logs dans les dashboards
```

### Flux des Métriques

```
1. Application expose des métriques (optionnel)
   OU Kubernetes expose des métriques (cAdvisor)
   ↓
2. Prometheus découvre les pods via Kubernetes API
   ↓
3. Prometheus scrape les métriques via HTTP GET
   ↓
4. Prometheus stocke dans TSDB
   ↓
5. Grafana interroge Prometheus avec PromQL
   ↓
6. Grafana affiche les métriques dans les dashboards
```

## Requêtes LogQL (Loki)

### Requêtes de Base

```logql
# Tous les logs d'un namespace
{namespace="intelectgame"}

# Logs d'un service spécifique
{namespace="intelectgame", app="auth-service"}

# Logs d'erreur
{namespace="intelectgame", log_level="error"}

# Logs contenant un mot-clé
{namespace="intelectgame"} |= "redis"

# Combinaison
{namespace="intelectgame", app="auth-service"} |= "error"
```

### Requêtes avec Agrégations

```logql
# Taux de logs par service
sum(rate({namespace="intelectgame"}[5m])) by (app)

# Taux d'erreurs par service
sum(rate({namespace="intelectgame", log_level="error"}[5m])) by (app)

# Nombre total de logs par service
sum(count_over_time({namespace="intelectgame"}[5m])) by (app)
```

## Requêtes PromQL (Prometheus)

### Requêtes de Base

```promql
# CPU usage par pod
container_cpu_usage_seconds_total

# Memory usage par pod
container_memory_usage_bytes

# Taux de requêtes HTTP (si exposé)
rate(http_requests_total[5m])

# Erreurs HTTP (si exposé)
rate(http_requests_total{status=~"5.."}[5m])
```

### Requêtes avec Agrégations

```promql
# CPU usage moyen par namespace
avg(container_cpu_usage_seconds_total) by (namespace)

# Memory usage total par pod
sum(container_memory_usage_bytes) by (pod)
```

## Déploiement

### 1. Déployer la Stack

```bash
helm upgrade --install loki-stack ./k8s/local/helm/loki-stack -n monitoring --create-namespace
```

### 2. Vérifier le Déploiement

```bash
# Vérifier les pods
kubectl get pods -n monitoring

# Devrait afficher :
# - loki-0
# - prometheus-0
# - grafana-xxx
# - promtail-xxx (un par nœud)
```

### 3. Accéder à Grafana

```bash
kubectl port-forward -n monitoring service/grafana 3000:3000
```

Puis ouvrir : http://localhost:3000
- Username: `admin`
- Password: `admin`

## Comparaison avec ELK

| Aspect | ELK Stack | Loki Stack |
|--------|-----------|------------|
| **Logs** | Elasticsearch + Logstash | Loki + Promtail |
| **Métriques** | Elasticsearch (via Beats) | Prometheus |
| **Visualisation** | Kibana | Grafana |
| **Indexation** | Contenu complet | Labels uniquement |
| **Ressources** | Plus lourd | Plus léger |
| **Requêtes** | Elasticsearch Query DSL | LogQL (similaire à PromQL) |
| **Intégration** | Bonne | Excellente (même écosystème) |

## Avantages de Loki + Prometheus + Grafana

1. **Cohérence** : Même modèle de labels pour logs et métriques
2. **Léger** : Moins de ressources que ELK
3. **Rapide** : Requêtes optimisées pour les labels
4. **Intégration** : Grafana supporte nativement Loki et Prometheus
5. **Simplicité** : LogQL est similaire à PromQL (courbe d'apprentissage réduite)

## Cas d'Usage

### Détecter les Erreurs

```logql
# Dans Grafana, créer un panel avec :
{namespace="intelectgame", log_level="error"}

# Ou avec un filtre de contenu :
{namespace="intelectgame"} |= "error" | json
```

### Analyser les Performances

```promql
# Temps de réponse moyen
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Taux de requêtes
rate(http_requests_total[5m])
```

### Monitoring par Service

```logql
# Logs d'un service spécifique
{namespace="intelectgame", app="auth-service"}

# Métriques d'un service
container_cpu_usage_seconds_total{namespace="intelectgame", pod=~"auth-service.*"}
```

## Scripts Utiles

- `./k8s/local/scripts/access-grafana.sh` - Accéder à Grafana
- `./k8s/local/scripts/verify-monitoring.sh` - Vérifier le monitoring

## Documentation

- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)


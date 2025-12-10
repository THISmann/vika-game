# 📊 Guide complet : Monitoring avec ELK Stack

Guide détaillé pour implémenter Elasticsearch, Logstash et Kibana pour centraliser les logs des endpoints critiques et monitorer les conteneurs Docker.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Déploiement](#déploiement)
4. [Configuration](#configuration)
5. [Utilisation](#utilisation)
6. [Dashboards](#dashboards)
7. [Alertes](#alertes)
8. [Maintenance](#maintenance)

## 🎯 Vue d'ensemble

Le stack ELK permet de :
- **Centraliser** tous les logs des conteneurs Docker
- **Parser** et **enrichir** les logs des endpoints critiques
- **Visualiser** les métriques en temps réel avec Kibana
- **Détecter** les problèmes rapidement avec des alertes

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ game-service │  │ auth-service │  │ quiz-service │    │
│  │   (Pod)      │  │   (Pod)      │  │   (Pod)      │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │             │
│         └─────────────────┼─────────────────┘             │
│                           │                                │
│                    ┌──────▼──────┐                         │
│                    │  Filebeat   │                         │
│                    │ (DaemonSet) │                         │
│                    └──────┬──────┘                         │
│                           │                                │
│                    ┌──────▼──────┐                         │
│                    │  Logstash   │                         │
│                    │ (Deployment)│                         │
│                    └──────┬──────┘                         │
│                           │                                │
│                    ┌──────▼──────┐                         │
│                    │Elasticsearch │                         │
│                    │(StatefulSet)│                         │
│                    └──────┬──────┘                         │
│                           │                                │
│                    ┌──────▼──────┐                         │
│                    │   Kibana     │                         │
│                    │ (Deployment) │                         │
│                    └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Flux de données

1. **Collecte** : Filebeat collecte les logs de tous les conteneurs
2. **Traitement** : Logstash parse et enrichit les logs
3. **Stockage** : Elasticsearch indexe les logs
4. **Visualisation** : Kibana affiche les dashboards

## 🚀 Déploiement

### Prérequis

- Cluster Kubernetes (Minikube, EKS, GKE, etc.)
- `kubectl` configuré
- Au moins 4GB de RAM disponible
- Storage class configuré

### Déploiement rapide

```bash
cd /path/to/gameV2
./k8s/monitoring/elk/deploy-elk.sh
```

### Vérification

```bash
# Vérifier que tous les pods sont prêts
kubectl get pods -n elk

# Devrait afficher :
# NAME                            READY   STATUS    RESTARTS   AGE
# elasticsearch-0                 1/1     Running   0          2m
# filebeat-xxxxx                  1/1     Running   0          1m
# kibana-xxxxx                    1/1     Running   0          1m
# logstash-xxxxx                  1/1     Running   0          1m
```

## ⚙️ Configuration

### Endpoints critiques configurés

Le fichier `logstash.conf` parse automatiquement :

#### Game Service
- `POST /game/answer` - Extraction : `player_id`, `question_id`, `is_correct`
- `POST /game/start` - Tag : `critical_endpoint: true`
- `POST /game/next` - Tag : `critical_endpoint: true`
- `GET /game/leaderboard` - Tag : `critical_endpoint: true`

#### Auth Service
- `POST /auth/admin/login` - Tag : `critical_endpoint: true`
- `POST /auth/players/register` - Tag : `critical_endpoint: true`

#### Quiz Service
- `GET /quiz/verify/:id` - Extraction : `question_id`
- `POST /quiz/create` - Tag : `critical_endpoint: true`

### Champs extraits automatiquement

- `player_id` : ID du joueur
- `player_name` : Nom du joueur
- `question_id` : ID de la question
- `is_correct` : Réponse correcte ou non
- `http_status` : Code HTTP de la réponse
- `endpoint_type` : Type d'endpoint (answer, auth, quiz, websocket)
- `log_level` : Niveau de log (error, warn, info, debug)
- `critical_endpoint` : Boolean indiquant si c'est un endpoint critique

## 📊 Utilisation

### Accès à Kibana

```bash
# Port-forward
kubectl port-forward -n elk service/kibana 5601:5601

# Ou via NodePort
# http://<NODE_IP>:30601
```

### Créer un index pattern

1. Allez dans **Management** → **Stack Management** → **Index Patterns**
2. Cliquez sur **Create index pattern**
3. Entrez : `gamev2-logs-*`
4. Sélectionnez `@timestamp` comme time field
5. Cliquez sur **Create index pattern**

### Requêtes KQL utiles

#### Tous les endpoints critiques
```
critical_endpoint: true
```

#### Erreurs sur les endpoints critiques
```
critical_endpoint: true AND log_level: "error"
```

#### Réponses des joueurs
```
endpoint_type: "answer" AND container_name: "game-service"
```

#### Temps de réponse > 1 seconde
```
has_performance_metric: true AND response_time > 1000
```

#### Erreurs WebSocket
```
endpoint_type: "websocket" AND log_level: "error"
```

## 📈 Dashboards

### Dashboard "Endpoints Critiques"

Créer un dashboard avec :

1. **Graphique des requêtes par endpoint**
   - Type : Line chart
   - Query : `critical_endpoint: true`
   - X-axis : `@timestamp` (histogram)
   - Y-axis : Count
   - Split by : `endpoint_type`

2. **Taux de succès par endpoint**
   - Type : Gauge
   - Query : `critical_endpoint: true`
   - Metric : `(count(http_status: 2*) / count(*)) * 100`

3. **Top 10 des erreurs**
   - Type : Data table
   - Query : `log_level: "error"`
   - Columns : `@timestamp`, `container_name`, `message`

### Dashboard "Performance"

1. **Temps de réponse moyen**
   - Type : Metric
   - Query : `has_performance_metric: true`
   - Metric : Average of `response_time`

2. **Latence p95**
   - Type : Line chart
   - Query : `has_performance_metric: true`
   - Metric : Percentile of `response_time` (95)

## 🚨 Alertes

### Créer une alerte

1. Allez dans **Management** → **Stack Management** → **Rules and Connectors**
2. Cliquez sur **Create rule**
3. Configurez :
   - **Name** : "Trop d'erreurs sur endpoints critiques"
   - **Query** : `critical_endpoint: true AND log_level: "error"`
   - **Condition** : `count() > 50` sur 5 minutes
   - **Action** : Email ou webhook

### Alertes recommandées

1. **Trop d'erreurs** : `count(log_level: "error") > 50` sur 5 minutes
2. **Service down** : Pas de logs depuis 2 minutes
3. **Temps de réponse élevé** : `avg(response_time) > 5000` sur 10 minutes
4. **Taux d'erreur élevé** : `(count(http_status: [45]*) / count(*)) * 100 > 10%`

## 🔧 Maintenance

### Nettoyer les anciens indices

```bash
# Supprimer les indices de plus de 30 jours
kubectl exec -it -n elk deployment/elasticsearch -- \
  curl -X DELETE "http://localhost:9200/gamev2-logs-$(date -d '30 days ago' +%Y.%m.%d)"
```

### Vérifier l'espace disque

```bash
kubectl exec -it -n elk deployment/elasticsearch -- \
  curl http://localhost:9200/_cat/allocation?v
```

### Redémarrer un service

```bash
kubectl rollout restart deployment/elasticsearch -n elk
kubectl rollout restart deployment/logstash -n elk
kubectl rollout restart deployment/kibana -n elk
```

## 📝 Notes

- Les logs sont conservés 7 jours par défaut
- Ajustez les ressources selon votre charge
- Activez la sécurité X-Pack pour la production
- Configurez des sauvegardes régulières d'Elasticsearch

## 🔗 Ressources

- [Documentation ELK](https://www.elastic.co/guide/index.html)
- [KQL Query Language](https://www.elastic.co/guide/en/kibana/current/kuery-query.html)
- [Grok Patterns](https://github.com/elastic/logstash/blob/v1.4.2/patterns/grok-patterns)


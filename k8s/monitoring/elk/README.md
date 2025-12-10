# 📊 Stack ELK (Elasticsearch, Logstash, Kibana) pour GameV2

Solution complète pour centraliser les logs des endpoints critiques et monitorer les conteneurs Docker.

## 🏗️ Architecture

```
┌─────────────────┐
│  Docker Pods    │
│  (game-service, │
│  auth-service,  │ ──logs──> ┌──────────┐
│  quiz-service)  │           │ Filebeat │ ──> ┌──────────┐
└─────────────────┘           └──────────┘     │ Logstash │ ──> ┌──────────────┐
                                                └──────────┘     │ Elasticsearch│
                                                                  └──────────────┘
                                                                         │
                                                                         v
                                                                  ┌──────────┐
                                                                  │  Kibana  │
                                                                  └──────────┘
```

### Composants

- **Filebeat** : Collecte les logs de tous les conteneurs Docker (DaemonSet)
- **Logstash** : Traite, enrichit et parse les logs des endpoints critiques
- **Elasticsearch** : Stocke et indexe les logs
- **Kibana** : Interface de visualisation et d'analyse avec dashboards

## 🚀 Déploiement

### Prérequis

- Cluster Kubernetes (Minikube, EKS, GKE, etc.)
- `kubectl` configuré
- Au moins 4GB de RAM disponible
- Storage class configuré (pour PersistentVolume)

### Déploiement automatique

```bash
chmod +x k8s/monitoring/elk/deploy-elk.sh
./k8s/monitoring/elk/deploy-elk.sh
```

### Déploiement manuel

```bash
# 1. Créer le namespace
kubectl create namespace elk

# 2. Déployer Elasticsearch
kubectl apply -f k8s/monitoring/elk/elasticsearch-deployment.yaml

# 3. Attendre qu'Elasticsearch soit prêt (2-3 minutes)
kubectl wait --for=condition=ready pod -l app=elasticsearch -n elk --timeout=300s

# 4. Déployer Logstash
kubectl apply -f k8s/monitoring/elk/logstash-deployment.yaml

# 5. Déployer Filebeat
kubectl apply -f k8s/monitoring/elk/filebeat-daemonset.yaml

# 6. Déployer Kibana
kubectl apply -f k8s/monitoring/elk/kibana-deployment.yaml
```

## 🔐 Accès à Kibana

### Sur Minikube local

```bash
kubectl port-forward -n elk service/kibana 5601:5601
```

Puis ouvrez : http://localhost:5601

### Sur cluster avec NodePort

Accédez via : `http://<NODE_IP>:30601`

### Sur EKS/GKE avec LoadBalancer

Modifiez le service Kibana pour utiliser `type: LoadBalancer` :

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kibana
  namespace: elk
spec:
  type: LoadBalancer  # Au lieu de NodePort
  ports:
  - port: 5601
    targetPort: 5601
```

## 📊 Configuration des Indices

### Indices créés automatiquement

- **`gamev2-logs-YYYY.MM.dd`** : Tous les logs
- **`gamev2-errors-YYYY.MM.dd`** : Logs d'erreur uniquement
- **`gamev2-critical-YYYY.MM.dd`** : Logs des endpoints critiques

### Endpoints critiques monitorés

#### Game Service
- `POST /game/answer` - Soumission de réponses
- `GET /game/score/:playerId` - Récupération des scores
- `GET /game/leaderboard` - Classement
- `POST /game/start` - Démarrage du jeu
- `POST /game/next` - Question suivante
- `POST /game/end` - Fin du jeu
- `GET /game/results` - Résultats

#### Auth Service
- `POST /auth/admin/login` - Connexion admin
- `POST /auth/players/register` - Inscription joueur
- `GET /auth/players` - Liste des joueurs

#### Quiz Service
- `GET /quiz/all` - Liste des questions
- `GET /quiz/full` - Questions complètes
- `POST /quiz/create` - Création de question
- `GET /quiz/verify/:id` - Vérification de réponse

#### WebSocket
- Connexions/déconnexions
- Événements `register`, `game:started`, `question:next`
- Erreurs de connexion

## 🔍 Utilisation dans Kibana

### 1. Créer un index pattern

1. Allez dans **Management** → **Stack Management** → **Index Patterns**
2. Cliquez sur **Create index pattern**
3. Entrez : `gamev2-logs-*`
4. Sélectionnez `@timestamp` comme time field
5. Cliquez sur **Create index pattern**

Répétez pour :
- `gamev2-errors-*`
- `gamev2-critical-*`

### 2. Requêtes KQL de base

Dans **Discover** :

#### Voir tous les logs
```
*
```

#### Logs d'un service spécifique
```
container_name: "game-service"
```

#### Logs des endpoints critiques
```
critical_endpoint: true
```

#### Logs d'erreur
```
log_level: "error"
```

#### Logs d'un endpoint spécifique
```
endpoint_type: "answer" AND container_name: "game-service"
```

#### Logs WebSocket
```
endpoint_type: "websocket"
```

#### Rechercher par player ID
```
player_id: "p1234567890"
```

#### Rechercher par question ID
```
question_id: "q1764929000053"
```

#### Logs des dernières 15 minutes
```
@timestamp >= now()-15m
```

### 3. Dashboards pré-configurés

#### Dashboard "Endpoints Critiques"

Créer un dashboard avec les visualisations suivantes :

**1. Graphique des requêtes par endpoint**
- Type : Line chart
- Query : `critical_endpoint: true`
- X-axis : `@timestamp` (histogram)
- Y-axis : Count
- Split by : `endpoint_type`

**2. Taux d'erreur par service**
- Type : Pie chart
- Query : `log_level: "error"`
- Split by : `container_name`

**3. Temps de réponse moyen**
- Type : Metric
- Query : `has_performance_metric: true`
- Metric : Average of `response_time`

**4. Top 10 des erreurs**
- Type : Data table
- Query : `log_level: "error"`
- Columns : `@timestamp`, `container_name`, `message`
- Sort by : `@timestamp` (desc)

**5. Logs WebSocket en temps réel**
- Type : Timeline
- Query : `endpoint_type: "websocket"`
- X-axis : `@timestamp`
- Y-axis : `event_name`

### 4. Alertes

Créer des alertes dans Kibana :

**1. Trop d'erreurs**
- Condition : `count(log_level: "error") > 50` sur 5 minutes
- Action : Email ou webhook

**2. Endpoint critique en erreur**
- Condition : `critical_endpoint: true AND log_level: "error"` sur 1 minute
- Action : Notification Slack

**3. Service down**
- Condition : Pas de logs depuis 2 minutes pour un service
- Action : PagerDuty

## 📈 Métriques importantes

### Endpoints critiques

- **Taux de succès** : `(count(http_status: 2*) / count(*)) * 100`
- **Temps de réponse moyen** : `avg(response_time)`
- **Nombre de requêtes par minute** : `count() over time`
- **Top erreurs** : `group by message where log_level: "error"`

### Performance

- **Latence p95** : `percentile(response_time, 95)`
- **Throughput** : `count() per minute`
- **Erreurs par service** : `count(log_level: "error") group by container_name`

### WebSocket

- **Connexions actives** : `count(endpoint_type: "websocket" AND connected_status: "true")`
- **Déconnexions** : `count(endpoint_type: "websocket" AND connected_status: "false")`
- **Erreurs de connexion** : `count(endpoint_type: "websocket" AND log_level: "error")`

## 🛠️ Maintenance

### Vérifier le statut

```bash
# Vérifier les pods
kubectl get pods -n elk

# Vérifier les logs
kubectl logs -f -n elk -l app=elasticsearch
kubectl logs -f -n elk -l app=logstash
kubectl logs -f -n elk -l app=filebeat
kubectl logs -f -n elk -l app=kibana
```

### Vérifier les indices Elasticsearch

```bash
# Lister les indices
kubectl exec -it -n elk deployment/elasticsearch -- curl http://localhost:9200/_cat/indices?v

# Voir les statistiques
kubectl exec -it -n elk deployment/elasticsearch -- curl http://localhost:9200/_stats

# Voir la santé du cluster
kubectl exec -it -n elk deployment/elasticsearch -- curl http://localhost:9200/_cluster/health?pretty
```

### Redémarrer un service

```bash
kubectl rollout restart deployment/elasticsearch -n elk
kubectl rollout restart deployment/logstash -n elk
kubectl rollout restart deployment/kibana -n elk
kubectl rollout restart daemonset/filebeat -n elk
```

### Nettoyer les anciens indices

```bash
# Supprimer les indices de plus de 30 jours
kubectl exec -it -n elk deployment/elasticsearch -- curl -X DELETE "http://localhost:9200/gamev2-logs-$(date -d '30 days ago' +%Y.%m.%d)"
```

### Augmenter la rétention

Modifiez la configuration Logstash pour changer la rétention :

```yaml
# Dans logstash-pipeline ConfigMap
output {
  elasticsearch {
    index => "gamev2-logs-%{+YYYY.MM.dd}"
    # Ajouter une politique ILM (Index Lifecycle Management)
  }
}
```

## 🔧 Configuration avancée

### Personnaliser les filtres Logstash

Éditez le ConfigMap `logstash-pipeline` :

```bash
kubectl edit configmap logstash-pipeline -n elk
```

Puis redémarrez Logstash :

```bash
kubectl rollout restart deployment/logstash -n elk
```

### Ajouter des champs personnalisés

Dans Logstash, ajoutez des champs :

```ruby
filter {
  if [container_name] == "game-service" {
    mutate {
      add_field => {
        "environment" => "production"
        "team" => "backend"
      }
    }
  }
}
```

### Configurer Filebeat pour des logs spécifiques

Modifiez le ConfigMap `filebeat-config` pour inclure/exclure des logs :

```yaml
filebeat.inputs:
- type: container
  paths:
    - /var/log/containers/*.log
  exclude_lines: ['DEBUG', 'TRACE']  # Exclure les logs de debug
  include_lines: ['ERROR', 'WARN', 'INFO']  # Inclure seulement certains niveaux
```

## 📝 Notes importantes

- **Stockage** : Elasticsearch utilise un PersistentVolume de 20GB. Ajustez selon vos besoins.
- **Ressources** : Les ressources par défaut sont minimales. Augmentez pour la production.
- **Sécurité** : La sécurité X-Pack est désactivée par défaut. Activez-la pour la production.
- **Performance** : Pour de gros volumes, augmentez les répliques et les ressources.

## 🐛 Dépannage

### Elasticsearch ne démarre pas

```bash
# Vérifier les logs
kubectl logs -n elk -l app=elasticsearch

# Vérifier les événements
kubectl describe pod -n elk -l app=elasticsearch

# Vérifier le PVC
kubectl get pvc -n elk
```

### Logstash ne reçoit pas de logs

```bash
# Vérifier la connexion Filebeat → Logstash
kubectl logs -n elk -l app=filebeat | grep logstash

# Vérifier que Logstash écoute
kubectl exec -it -n elk deployment/logstash -- netstat -tlnp | grep 5044
```

### Filebeat ne collecte pas les logs

```bash
# Vérifier les permissions
kubectl exec -it -n elk daemonset/filebeat -- ls -la /var/log/containers/

# Vérifier la configuration
kubectl exec -it -n elk daemonset/filebeat -- cat /etc/filebeat.yml
```

### Kibana ne se connecte pas à Elasticsearch

```bash
# Vérifier la configuration
kubectl exec -it -n elk deployment/kibana -- env | grep ELASTICSEARCH

# Tester la connexion depuis Kibana
kubectl exec -it -n elk deployment/kibana -- curl http://elasticsearch:9200
```

## 🔗 Ressources

- [Documentation Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Documentation Logstash](https://www.elastic.co/guide/en/logstash/current/index.html)
- [Documentation Filebeat](https://www.elastic.co/guide/en/beats/filebeat/current/index.html)
- [Documentation Kibana](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Grok Patterns](https://github.com/elastic/logstash/blob/v1.4.2/patterns/grok-patterns)


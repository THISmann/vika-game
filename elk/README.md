# 📊 Stack ELK avec Docker Compose

Solution complète pour centraliser les logs des endpoints critiques et monitorer les conteneurs Docker avec Docker Compose.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ game-service │  │ auth-service │  │ quiz-service │   │
│  │  (Container) │  │  (Container) │  │  (Container) │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │            │
│         └─────────────────┼─────────────────┘            │
│                           │                               │
│                    ┌──────▼──────┐                        │
│                    │  Filebeat   │                        │
│                    │  (Container)│                        │
│                    └──────┬──────┘                        │
│                           │                               │
│                    ┌──────▼──────┐                        │
│                    │  Logstash   │                        │
│                    │  (Container) │                        │
│                    └──────┬──────┘                        │
│                           │                               │
│                    ┌──────▼──────┐                        │
│                    │Elasticsearch │                        │
│                    │  (Container)│                        │
│                    └──────┬──────┘                        │
│                           │                               │
│                    ┌──────▼──────┐                        │
│                    │   Kibana     │                        │
│                    │  (Container) │                        │
│                    └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Déploiement

### Prérequis

- Docker installé
- Docker Compose installé
- Au moins 4GB de RAM disponible
- Ports disponibles : 9200, 5601, 5044

### Déploiement automatique

```bash
./elk/deploy-elk.sh
```

### Déploiement manuel

```bash
# Démarrer tous les services
docker-compose -f docker-compose.elk.yml up -d

# Vérifier le statut
docker-compose -f docker-compose.elk.yml ps

# Voir les logs
docker-compose -f docker-compose.elk.yml logs -f
```

## 🔐 Accès aux services

### Elasticsearch

```bash
# Vérifier la santé
curl http://localhost:9200/_cluster/health?pretty

# Lister les indices
curl http://localhost:9200/_cat/indices?v

# Rechercher dans les logs
curl -X GET "http://localhost:9200/gamev2-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "critical_endpoint": "true"
    }
  }
}'
```

### Kibana

Ouvrez votre navigateur : **http://localhost:5601**

## 📊 Configuration des Indices

### Indices créés automatiquement

- **`gamev2-logs-YYYY.MM.dd`** : Tous les logs
- **`gamev2-errors-YYYY.MM.dd`** : Logs d'erreur uniquement
- **`gamev2-critical-YYYY.MM.dd`** : Logs des endpoints critiques
- **`gamev2-websocket-YYYY.MM.dd`** : Logs WebSocket

### Endpoints critiques monitorés

#### Game Service
- `POST /game/answer` - Extraction : `player_id`, `question_id`, `is_correct`
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

### Quick Start

Pour un guide rapide, exécutez :
```bash
./elk/kibana-quick-start.sh
```

Ou consultez :
- `elk/KIBANA_VISUALIZATION_GUIDE.md` - Guide complet étape par étape
- `elk/KIBANA_EXAMPLES.md` - Exemples de requêtes et visualisations

### 1. Créer un index pattern

1. Allez dans **Management** → **Stack Management** → **Index Patterns**
2. Cliquez sur **Create index pattern**
3. Entrez : `gamev2-logs-*`
4. Sélectionnez `@timestamp` comme time field
5. Cliquez sur **Create index pattern**

Répétez pour :
- `gamev2-errors-*`
- `gamev2-critical-*`
- `gamev2-websocket-*`

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

## 🛠️ Maintenance

### Vérifier le statut

```bash
# Vérifier les conteneurs
docker-compose -f docker-compose.elk.yml ps

# Vérifier les logs
docker-compose -f docker-compose.elk.yml logs -f elasticsearch
docker-compose -f docker-compose.elk.yml logs -f logstash
docker-compose -f docker-compose.elk.yml logs -f kibana
docker-compose -f docker-compose.elk.yml logs -f filebeat
```

### Redémarrer un service

```bash
docker-compose -f docker-compose.elk.yml restart elasticsearch
docker-compose -f docker-compose.elk.yml restart logstash
docker-compose -f docker-compose.elk.yml restart kibana
docker-compose -f docker-compose.elk.yml restart filebeat
```

### Arrêter les services

```bash
docker-compose -f docker-compose.elk.yml down
```

### Supprimer les données (⚠️ Attention)

```bash
# Arrêter et supprimer les volumes
docker-compose -f docker-compose.elk.yml down -v
```

### Nettoyer les anciens indices

```bash
# Supprimer les indices de plus de 30 jours
curl -X DELETE "http://localhost:9200/gamev2-logs-$(date -d '30 days ago' +%Y.%m.%d)"
curl -X DELETE "http://localhost:9200/gamev2-errors-$(date -d '30 days ago' +%Y.%m.%d)"
curl -X DELETE "http://localhost:9200/gamev2-critical-$(date -d '30 days ago' +%Y.%m.%d)"
```

## 🔧 Configuration avancée

### Personnaliser les filtres Logstash

Éditez le fichier `elk/logstash/pipeline/logstash.conf` :

```bash
nano elk/logstash/pipeline/logstash.conf
```

Puis redémarrez Logstash :

```bash
docker-compose -f docker-compose.elk.yml restart logstash
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

Modifiez le fichier `elk/filebeat/filebeat.yml` :

```yaml
filebeat.inputs:
  - type: container
    paths:
      - '/var/lib/docker/containers/*/*.log'
    exclude_lines: ['DEBUG', 'TRACE']  # Exclure les logs de debug
    include_lines: ['ERROR', 'WARN', 'INFO']  # Inclure seulement certains niveaux
```

## 📝 Notes importantes

- **Stockage** : Elasticsearch utilise un volume Docker. Les données persistent entre les redémarrages.
- **Ressources** : Les ressources par défaut sont minimales. Augmentez pour la production.
- **Sécurité** : La sécurité X-Pack est désactivée par défaut. Activez-la pour la production.
- **Performance** : Pour de gros volumes, augmentez les ressources dans `docker-compose.elk.yml`.

## 🐛 Dépannage

### Kibana timeout errors

Si vous voyez des erreurs "Request timed out" dans les logs de Kibana :

```bash
# Utiliser le script de correction automatique
./elk/fix-kibana-timeout.sh

# Ou redémarrer manuellement
docker-compose -f docker-compose.elk.yml restart kibana
```

Pour plus de détails, consultez `elk/TROUBLESHOOTING.md`.

### Elasticsearch ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.elk.yml logs elasticsearch

# Vérifier les ressources
docker stats elk-elasticsearch
```

### Logstash ne reçoit pas de logs

```bash
# Vérifier la connexion Filebeat → Logstash
docker-compose -f docker-compose.elk.yml logs filebeat | grep logstash

# Vérifier que Logstash écoute
docker exec elk-logstash netstat -tlnp | grep 5044
```

### Filebeat ne collecte pas les logs

```bash
# Vérifier les permissions
docker exec elk-filebeat ls -la /var/lib/docker/containers/

# Vérifier la configuration
docker exec elk-filebeat cat /usr/share/filebeat/filebeat.yml
```

### Kibana ne se connecte pas à Elasticsearch

```bash
# Vérifier la configuration
docker exec elk-kibana env | grep ELASTICSEARCH

# Tester la connexion depuis Kibana
docker exec elk-kibana curl http://elasticsearch:9200
```

## 🔗 Ressources

- [Documentation Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Documentation Logstash](https://www.elastic.co/guide/en/logstash/current/index.html)
- [Documentation Filebeat](https://www.elastic.co/guide/en/beats/filebeat/current/index.html)
- [Documentation Kibana](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Grok Patterns](https://github.com/elastic/logstash/blob/v1.4.2/patterns/grok-patterns)


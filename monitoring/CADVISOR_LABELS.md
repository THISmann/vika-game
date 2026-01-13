# cAdvisor Labels dans Prometheus

## Problème identifié

cAdvisor n'expose **pas** le label `name` dans les métriques `container_last_seen` et autres métriques de container. Il utilise uniquement le label `id` qui contient l'ID du container Docker (ex: `/docker/44a29ab0b5ca62732c6c84b1f8a14db4857b806581e011870bb23d76ad97db31`).

## Labels disponibles

Les métriques cAdvisor ont les labels suivants :
- `id` : ID du container (ex: `/docker/<container_id>`)
- `instance` : Instance cAdvisor (ex: `cadvisor:8080`)
- `job` : Job Prometheus (ex: `cadvisor`)
- `service` : Service label (ex: `cadvisor`)
- `type` : Type label (ex: `infrastructure`)

**Il n'y a PAS de label `name`** dans les métriques cAdvisor standard.

## Solution

Pour compter ou filtrer les containers dans les dashboards Grafana, il faut :

1. **Utiliser le label `id`** au lieu de `name`
2. **Filtrer par pattern d'ID** : Les containers Docker ont un ID qui correspond au pattern `/docker/[a-f0-9]{64}`
3. **Exclure les conteneurs système** comme `/docker/buildkit` ou `/docker/buildx`

## Requêtes PromQL corrigées

### Compter les containers Docker actifs
```promql
count(container_last_seen{id=~"/docker/[a-f0-9]+$"})
```

Cette requête :
- Filtre les containers avec `id` commençant par `/docker/`
- Exclut les conteneurs système (buildkit, buildx) en utilisant le pattern `[a-f0-9]+$` (seulement des IDs hexadécimaux)

### Lister les containers Docker
```promql
container_last_seen{id=~"/docker/[a-f0-9]+$"}
```

### Toutes les métriques de containers Docker
```promql
container_memory_usage_bytes{id=~"/docker/.*"}
container_cpu_usage_seconds_total{id=~"/docker/.*"}
```

## Note

Si vous avez besoin du **nom** du container (ex: `intelectgame-api-gateway`), vous devrez :
1. Créer un service de mapping entre les IDs Docker et les noms de containers
2. Ou utiliser l'API Docker pour récupérer les noms
3. Ou utiliser des métriques personnalisées qui incluent le nom du container

Pour la plupart des cas d'usage, l'ID Docker est suffisant pour identifier les containers.


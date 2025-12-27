# Comment utiliser Prometheus

## ✅ Prometheus fonctionne correctement !

Tous les targets sont UP et les métriques sont collectées. Voici comment les utiliser :

## 1. Vérifier les targets

Allez sur : **http://localhost:9090/targets**

Vous devriez voir tous les targets en vert (UP) :
- ✅ api-gateway:3000
- ✅ cadvisor:8080  
- ✅ node-exporter:9100
- ✅ localhost:9090 (Prometheus lui-même)

## 2. Requêtes PromQL utiles

### Vérifier que Prometheus collecte des données

Dans l'onglet **Graph** de Prometheus (http://localhost:9090), essayez ces requêtes :

#### a) Vérifier l'état des services
```
up
```
Vous devriez voir 4 résultats (tous les targets).

#### b) Métriques des containers (cAdvisor)
```
container_cpu_usage_seconds_total
```

```
container_memory_usage_bytes
```

```
container_network_receive_bytes_total
```

```
container_network_transmit_bytes_total
```

#### c) Métriques de l'API Gateway
```
http_requests_total
```

```
http_request_duration_seconds
```

```
http_request_errors_total
```

```
http_active_connections
```

#### d) Compter les containers actifs
```
count(container_last_seen{name=~".*intelectgame.*"})
```

## 3. Graphiques dans l'interface Prometheus

1. Allez sur **http://localhost:9090**
2. Cliquez sur l'onglet **Graph**
3. Entrez une requête (ex: `up`)
4. Cliquez sur **Execute**
5. Cliquez sur l'onglet **Graph** pour voir la visualisation

### Exemples de requêtes avec calculs

**Taux de requêtes HTTP par seconde :**
```
rate(http_requests_total[5m])
```

**CPU des containers en pourcentage :**
```
rate(container_cpu_usage_seconds_total[5m]) * 100
```

**Mémoire des containers :**
```
container_memory_usage_bytes
```

**Erreurs HTTP :**
```
rate(http_request_errors_total[5m])
```

## 4. Pourquoi vous voyez peut-être "vide"

Si vous allez sur http://localhost:9090/query sans entrer de requête, vous verrez une page vide. C'est normal !

### Solution :
1. Allez sur **http://localhost:9090**
2. Cliquez sur l'onglet **Graph** (ou restez sur l'onglet par défaut)
3. Entrez une requête dans le champ de recherche (ex: `up`)
4. Cliquez sur **Execute**
5. Vous verrez les résultats !

## 5. Vérifier via l'API

Vous pouvez aussi vérifier via l'API REST :

```bash
# Liste des métriques disponibles
curl 'http://localhost:9090/api/v1/label/__name__/values'

# Vérifier l'état des targets
curl 'http://localhost:9090/api/v1/targets'

# Requête spécifique
curl 'http://localhost:9090/api/v1/query?query=up'
```

## 6. Utiliser Grafana

Pour visualiser les données, utilisez **Grafana** : http://localhost:3005

Les dashboards sont déjà configurés :
- **API Gateway Monitoring** : http://localhost:3005/d/api-gateway-dashboard/api-gateway-monitoring
- **Containers Monitoring** : http://localhost:3005/d/containers-dashboard/containers-monitoring

## Résumé

**Prometheus n'est PAS vide !** Les métriques sont collectées. Vous devez simplement entrer des requêtes PromQL pour les voir.

Si les dashboards Grafana affichent "No data", c'est probablement parce que :
1. Les requêtes dans les dashboards ne correspondent pas aux métriques disponibles
2. Ou il n'y a pas encore assez de données collectées

Les métriques sont bien là, vérifiez avec `up` dans l'interface Prometheus !


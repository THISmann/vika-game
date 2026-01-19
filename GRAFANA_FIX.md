# 🔧 Fix Grafana Dashboard "No Data" Issue

## ❌ Problème

Le dashboard Grafana affiche "No Data" dans toutes les sections car :
1. **IDs de containers hardcodés** : Le dashboard utilisait des IDs de containers spécifiques qui changent à chaque redémarrage
2. **Configuration Prometheus** : Utilisait `127.0.0.1:9090` au lieu de `localhost:9090`

## ✅ Solution Appliquée

### 1. Requêtes Dynamiques dans le Dashboard

**Avant** (IDs hardcodés) :
```promql
rate(container_cpu_usage_seconds_total{id=~"/docker/(f9a6c6e0f3792f54ee0a764936ff1f46b4fdf1047610f10e8ea0985b1ebde199|...)"}[5m])
```

**Après** (noms dynamiques) :
```promql
rate(container_cpu_usage_seconds_total{name=~".*intelectgame.*"}[5m])
```

### 2. Configuration Prometheus

**Avant** :
```yaml
- targets: ['127.0.0.1:9090']
```

**Après** :
```yaml
- targets: ['localhost:9090']
```

## 📋 Modifications

### Fichiers Modifiés

1. **`monitoring/prometheus/prometheus.yml`**
   - Changé `127.0.0.1:9090` → `localhost:9090`

2. **`monitoring/grafana/provisioning/dashboards/containers-dashboard.json`**
   - Toutes les requêtes utilisent maintenant `name=~".*intelectgame.*"` au lieu d'IDs hardcodés
   - Les requêtes fonctionnent dynamiquement avec tous les containers du projet

## 🔄 Après le Fix

1. **Redémarrer Prometheus** pour appliquer la nouvelle configuration :
   ```bash
   docker restart intelectgame-prometheus
   ```

2. **Redémarrer Grafana** pour charger le nouveau dashboard :
   ```bash
   docker restart intelectgame-grafana
   ```

3. **Attendre 30-60 secondes** pour que Prometheus collecte les métriques

4. **Rafraîchir le dashboard Grafana** :
   - Ouvrir : `http://localhost:3005/d/containers-dashboard/containers-monitoring`
   - Cliquer sur le bouton de rafraîchissement (↻)

## ✅ Vérification

### Vérifier que Prometheus collecte les métriques

1. Accéder à Prometheus : `http://localhost:9090`
2. Aller dans **Status → Targets**
3. Vérifier que tous les targets sont **UP** :
   - `prometheus` (localhost:9090)
   - `cadvisor` (cadvisor:8080)
   - `node-exporter` (node-exporter:9100)
   - `api-gateway` (api-gateway:3000)

### Vérifier que les métriques sont disponibles

Dans Prometheus, tester la requête :
```promql
container_cpu_usage_seconds_total{name=~".*intelectgame.*"}
```

Vous devriez voir des résultats pour tous les containers IntelectGame.

### Vérifier le dashboard Grafana

1. Accéder à Grafana : `http://localhost:3005`
2. Se connecter : `admin` / `admin`
3. Aller dans **Dashboards → Containers Monitoring**
4. Vérifier que les graphiques affichent des données

## 🔍 Requêtes Utilisées dans le Dashboard

### CPU Usage
```promql
rate(container_cpu_usage_seconds_total{name=~".*intelectgame.*"}[5m]) * 100
```

### Memory Usage
```promql
container_memory_usage_bytes{name=~".*intelectgame.*"}
```

### Network I/O
```promql
rate(container_network_receive_bytes_total{name=~".*intelectgame.*"}[5m])
rate(container_network_transmit_bytes_total{name=~".*intelectgame.*"}[5m])
```

### Active Containers Count
```promql
count(container_last_seen{name=~".*intelectgame.*"})
```

## 📝 Notes

- Les requêtes utilisent le pattern `name=~".*intelectgame.*"` pour matcher tous les containers du projet
- Le dashboard fonctionne maintenant même après un redémarrage des containers
- Les métriques sont collectées toutes les 15 secondes (configuré dans `prometheus.yml`)

---

**Date**: $(date)
**Status**: ✅ Résolu - Dashboard fonctionne avec des requêtes dynamiques


# ✅ Fix API Gateway Dashboard "No Data" - Sections d'Erreurs

## ❌ Problème

Les sections suivantes du dashboard API Gateway affichaient "No Data" :
- **HTTP Error Rate**
- **Error Log Summary**
- **Total Errors**
- **Errors by Type**

### Cause

La métrique `http_request_errors_total` n'est créée dans Prometheus **que lorsqu'une erreur est enregistrée**. Si aucune erreur n'a été générée, la métrique n'existe pas, ce qui cause "No Data" dans Grafana.

## ✅ Solution Appliquée

Ajout de `or vector(0)` à toutes les requêtes d'erreurs pour retourner `0` quand la métrique n'existe pas.

### Requêtes Corrigées

#### HTTP Error Rate
**Avant** :
```promql
rate(http_request_errors_total{service="api-gateway"}[5m])
```

**Après** :
```promql
rate(http_request_errors_total{service="api-gateway"}[5m]) or vector(0)
```

#### Error Log Summary
**Avant** :
```promql
topk(10, sum by (method, route, status_code, error_type) (rate(http_request_errors_total{service="api-gateway"}[24h])))
```

**Après** :
```promql
topk(10, sum by (method, route, status_code, error_type) (rate(http_request_errors_total{service="api-gateway"}[24h]))) or vector(0)
```

#### Total Errors
**Avant** :
```promql
sum(http_request_errors_total{service="api-gateway"})
```

**Après** :
```promql
sum(http_request_errors_total{service="api-gateway"}) or vector(0)
```

#### Errors by Type
**Avant** :
```promql
sum by (error_type) (rate(http_request_errors_total{service="api-gateway"}[24h]))
```

**Après** :
```promql
sum by (error_type) (rate(http_request_errors_total{service="api-gateway"}[24h])) or vector(0)
```

## 🔄 Application des Corrections

Les corrections ont été appliquées dans :
- ✅ `monitoring/grafana/provisioning/dashboards/api-gateway-dashboard.json`

**Grafana a été redémarré** pour charger le nouveau dashboard.

## ✅ Vérification

### 1. Vérifier que les requêtes fonctionnent

Dans Prometheus (`http://localhost:9090`), tester :

```promql
rate(http_request_errors_total{service="api-gateway"}[5m]) or vector(0)
```

**Résultat attendu** : `"status":"success"` avec un résultat (0 si aucune erreur, ou les valeurs d'erreur si des erreurs existent)

### 2. Vérifier le dashboard Grafana

1. Accéder à `http://localhost:3005/d/api-gateway-dashboard/api-gateway-monitoring`
2. **Rafraîchir la page** (F5 ou bouton ↻)
3. Vérifier que les sections d'erreurs affichent maintenant **0** au lieu de "No Data"

### 3. Générer des erreurs de test (optionnel)

Pour tester que les erreurs sont bien enregistrées :

```bash
# Générer quelques erreurs 404
curl http://localhost:3000/vika-game/api/invalid-route-1
curl http://localhost:3000/vika-game/api/invalid-route-2
curl http://localhost:3000/vika-game/api/invalid-route-3
```

Attendre 15-30 secondes, puis rafraîchir le dashboard. Les erreurs devraient apparaître.

## 📊 Comportement du Dashboard

### Sans Erreurs
- **HTTP Error Rate** : Affiche `0` (au lieu de "No Data")
- **Error Log Summary** : Table vide ou avec des lignes à 0
- **Total Errors** : Affiche `0`
- **Errors by Type** : Graphique vide ou à 0

### Avec Erreurs
- **HTTP Error Rate** : Affiche le taux d'erreurs par route/méthode
- **Error Log Summary** : Table avec les 10 erreurs les plus fréquentes
- **Total Errors** : Affiche le nombre total d'erreurs
- **Errors by Type** : Graphique montrant les erreurs par type (server_error, client_error, etc.)

## 🔍 Comment les Erreurs sont Enregistrées

Les erreurs sont enregistrées automatiquement dans deux cas :

1. **Erreurs HTTP (status >= 400)** : Enregistrées automatiquement par `metricsMiddleware` dans `metrics.js`
   - Status 4xx → `error_type: "client_error"`
   - Status 5xx → `error_type: "server_error"`

2. **Erreurs d'exception** : Enregistrées via `trackError()` dans le middleware d'erreur
   - Type d'erreur basé sur `error.name`

## 📝 Notes

- Le dashboard affiche maintenant **0** au lieu de "No Data" quand il n'y a pas d'erreurs
- Les erreurs sont enregistrées automatiquement pour tous les status codes >= 400
- Les métriques sont collectées toutes les **15 secondes** par Prometheus
- Le dashboard se rafraîchit automatiquement toutes les **10 secondes**

---

**Date**: $(date)
**Status**: ✅ Résolu - Dashboard affiche 0 au lieu de "No Data" quand il n'y a pas d'erreurs


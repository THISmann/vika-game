# Vérification rapide Prometheus

## ✅ État actuel : Prometheus fonctionne !

### Vérifications effectuées :

1. ✅ Tous les targets sont UP
   - api-gateway:3000 - UP
   - cadvisor:8080 - UP
   - node-exporter:9100 - UP
   - prometheus:9090 - UP

2. ✅ Les métriques sont collectées :
   - `container_cpu_usage_seconds_total` - ✅ Disponible
   - `container_memory_usage_bytes` - ✅ Disponible
   - `http_requests_total` - ✅ Disponible
   - `http_request_errors_total` - ✅ Disponible

3. ✅ La configuration est correcte

## Comment vérifier vous-même :

### Méthode 1 : Interface Web Prometheus

1. Allez sur **http://localhost:9090**
2. Cliquez sur l'onglet **Graph**
3. Entrez cette requête : `up`
4. Cliquez sur **Execute**
5. Vous devriez voir **4 résultats** (tous les services)

### Méthode 2 : Requête API

```bash
curl 'http://localhost:9090/api/v1/query?query=up' | python3 -m json.tool
```

Vous devriez voir 4 résultats avec `"value": [..., "1"]`

### Méthode 3 : Vérifier les targets

Allez sur **http://localhost:9090/targets**

Tous doivent être verts (UP) et sans erreurs.

## Si vous voyez "vide" dans Prometheus

**C'est normal !** L'interface Prometheus nécessite que vous entriez une requête pour voir les données.

**Solution :**
- Entrez une requête (ex: `up`) dans le champ de recherche
- Cliquez sur **Execute**
- Les résultats apparaîtront

## Prochaines étapes

Pour visualiser les données avec des graphiques, utilisez **Grafana** :
- http://localhost:3005 (admin/admin)
- Dashboards disponibles :
  - API Gateway Monitoring
  - Containers Monitoring


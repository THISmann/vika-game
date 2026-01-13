# Setup Grafana Dashboards

Si les dashboards n'apparaissent pas dans Grafana après le démarrage, suivez ces étapes :

## Vérification

1. **Vérifier les logs Grafana** :
```bash
docker-compose logs grafana
```

2. **Redémarrer Grafana** pour forcer le rechargement des dashboards :
```bash
docker-compose restart grafana
```

3. **Vérifier que les fichiers sont bien montés** :
```bash
docker-compose exec grafana ls -la /etc/grafana/provisioning/dashboards/
```

4. **Vérifier la configuration du datasource** :
   - Aller dans Grafana : http://localhost:3005
   - Configuration → Data sources
   - Vérifier que Prometheus est configuré et testé

## Import manuel (si nécessaire)

Si les dashboards ne se chargent pas automatiquement :

1. Aller dans Grafana : http://localhost:3005
2. Dashboards → Import
3. Copier le contenu des fichiers JSON depuis `monitoring/grafana/provisioning/dashboards/`
4. Coller dans l'éditeur JSON et cliquer sur "Load"
5. Sélectionner la datasource Prometheus
6. Cliquer sur "Import"

## Structure des fichiers

Les dashboards doivent être :
- Dans `/etc/grafana/provisioning/dashboards/` (monté depuis `./monitoring/grafana/provisioning/dashboards`)
- Format JSON direct (pas enveloppé dans `{"dashboard": {...}}`)
- Avec un `uid` unique
- Schema version 16 ou supérieur


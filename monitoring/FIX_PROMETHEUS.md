# Corrections apportées

## Problème 1 : Prometheus est vide

**Solution** : Vérifier que Prometheus peut accéder aux services

1. Vérifier les targets dans Prometheus : http://localhost:9090/targets
2. Si les targets sont DOWN, vérifier :
   - Que tous les services sont démarrés : `docker-compose ps`
   - Que Prometheus est sur le réseau `app-network` (déjà configuré)
   - Vérifier les logs : `docker-compose logs prometheus`

3. Tester la connexion depuis Prometheus :
```bash
docker-compose exec prometheus wget -O- http://api-gateway:3000/metrics
```

4. Si ça ne fonctionne pas, redémarrer Prometheus :
```bash
docker-compose restart prometheus
```

## Problème 2 : Dashboard Containers - Nombre de containers actifs

**Solution appliquée** : Ajout d'un panel "Active Containers" qui compte les containers avec le nom `intelectgame`.

Le dashboard affiche maintenant :
- **Active Containers** : Nombre total de containers actifs de l'application
- **Container Status** : Tableau avec la liste des containers et leur statut

Les métriques filtrent par `name=~".*intelectgame.*"` pour ne montrer que les containers de l'application.

## Problème 3 : Error Log Summary affiche "No data"

**Raisons possibles** :
1. **Aucune erreur n'a été enregistrée** - C'est normal si l'application fonctionne bien !
2. **L'API Gateway vient de démarrer** - Il faut attendre quelques requêtes pour avoir des métriques
3. **La métrique n'existe pas encore** - Si aucune erreur n'a été trackée, la métrique n'apparaît pas

**Pour tester** :
1. Faire une requête qui génère une erreur (ex: accéder à une route inexistante)
2. Vérifier dans Prometheus : `http_request_errors_total{service="api-gateway"}`
3. Le tableau devrait alors afficher les données

**Solution appliquée** : 
- Ajout d'un panel "Total Errors" qui affiche la somme totale des erreurs
- Ajout d'un panel "Errors by Type" qui affiche les erreurs par type
- Le tableau "Error Log Summary" affiche maintenant les top 10 erreurs avec leurs détails

## Commandes utiles pour vérifier

```bash
# Vérifier que les métriques sont exposées
curl http://localhost:3000/metrics | grep http_request

# Vérifier les targets Prometheus
curl http://localhost:9090/api/v1/targets

# Vérifier une métrique spécifique
curl 'http://localhost:9090/api/v1/query?query=http_requests_total'

# Voir les logs Prometheus
docker-compose logs prometheus | tail -50

# Redémarrer tous les services de monitoring
docker-compose restart prometheus grafana cadvisor
```

## Pour appliquer les corrections

Après avoir modifié les fichiers, redémarrer les services :

```bash
docker-compose restart prometheus grafana
```

Ou si nécessaire, reconstruire et redémarrer :

```bash
docker-compose down
docker-compose up -d prometheus grafana cadvisor node-exporter
```


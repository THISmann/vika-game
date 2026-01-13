# Mise à jour du Dashboard Containers

## Problème

Le dashboard comptait **tous** les containers Docker du système, pas seulement ceux du projet IntelectGame.

## Solution

Le dashboard a été mis à jour pour filtrer uniquement les containers IntelectGame en utilisant leurs IDs Docker complets.

## Mise à jour manuelle (si les containers sont redémarrés)

Si les containers sont redémarrés, leurs IDs Docker changent. Pour mettre à jour le dashboard :

1. **Générer la nouvelle requête** :
```bash
./monitoring/generate_intelectgame_query.sh
```

2. **Copier les IDs** et mettre à jour le dashboard dans Grafana :
   - Aller sur http://localhost:3005
   - Ouvrir le dashboard "Containers Monitoring"
   - Éditer chaque panel
   - Remplacer les IDs dans les requêtes PromQL

3. **Ou utiliser le script automatique** (à venir) qui met à jour le dashboard JSON directement.

## IDs actuels des containers IntelectGame

Les IDs sont générés dynamiquement par le script `monitoring/generate_intelectgame_query.sh`.

Pour voir les IDs actuels :
```bash
docker ps --format "{{.Names}}" | grep intelectgame | while read name; do
    id=$(docker inspect "$name" --format '{{.Id}}')
    echo "$name -> /docker/$id"
done
```

## Note importante

Les IDs Docker changent à chaque redémarrage de container. Pour une solution permanente, il faudrait :
1. Créer un service qui maintient un mapping ID -> nom
2. Ou utiliser des labels Docker personnalisés (si cAdvisor les expose)
3. Ou utiliser un exporter Prometheus personnalisé qui ajoute les labels Docker Compose

Pour l'instant, la solution manuelle fonctionne mais nécessite une mise à jour après chaque redémarrage des containers.


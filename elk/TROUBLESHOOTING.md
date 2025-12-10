# 🐛 Dépannage ELK Stack

Guide pour résoudre les problèmes courants avec le stack ELK.

## ⚠️ Problème : Kibana timeout errors

### Symptômes
```
[ERROR] TimeoutError: Request timed out
[WARN] Kibana is now degraded (was unavailable)
```

### Causes possibles
1. Elasticsearch est trop lent ou surchargé
2. Ressources insuffisantes (RAM/CPU)
3. Timeout trop court dans la configuration
4. Elasticsearch n'est pas complètement prêt

### Solutions

#### Solution 1 : Redémarrer avec la configuration corrigée

```bash
# Arrêter tous les services
docker-compose -f docker-compose.elk.yml down

# Redémarrer avec la nouvelle configuration
docker-compose -f docker-compose.elk.yml up -d

# Utiliser le script de correction
./elk/fix-kibana-timeout.sh
```

#### Solution 2 : Vérifier les ressources

```bash
# Vérifier l'utilisation des ressources
docker stats elk-elasticsearch elk-kibana elk-logstash

# Si Elasticsearch utilise trop de RAM, augmenter les limites dans docker-compose.elk.yml
```

#### Solution 3 : Augmenter les timeouts manuellement

Si le problème persiste, vous pouvez augmenter les timeouts dans Kibana :

```bash
# Éditer la configuration Kibana
docker exec elk-kibana env | grep ELASTICSEARCH

# Redémarrer Kibana avec des timeouts plus longs
docker-compose -f docker-compose.elk.yml stop kibana
docker-compose -f docker-compose.elk.yml up -d kibana
```

#### Solution 4 : Vérifier la santé d'Elasticsearch

```bash
# Vérifier la santé du cluster
curl http://localhost:9200/_cluster/health?pretty

# Devrait retourner "green" ou "yellow"
# Si "red", il y a un problème avec Elasticsearch
```

#### Solution 5 : Nettoyer et redémarrer

```bash
# Arrêter tous les services
docker-compose -f docker-compose.elk.yml down

# Supprimer les volumes (⚠️ supprime toutes les données)
docker-compose -f docker-compose.elk.yml down -v

# Redémarrer
docker-compose -f docker-compose.elk.yml up -d
```

## ⚠️ Problème : Elasticsearch ne démarre pas

### Symptômes
```
elasticsearch exited with code 1
```

### Solutions

#### Solution 1 : Vérifier les permissions

```bash
# Vérifier les permissions du volume
docker volume inspect gamev2_elasticsearch-data

# Si nécessaire, corriger les permissions
sudo chown -R 1000:1000 /var/lib/docker/volumes/gamev2_elasticsearch-data/_data
```

#### Solution 2 : Vérifier les ressources

Elasticsearch nécessite au moins 2GB de RAM disponible :

```bash
# Vérifier la RAM disponible
free -h

# Si insuffisant, réduire les limites dans docker-compose.elk.yml
# ou libérer de la RAM
```

#### Solution 3 : Vérifier les logs

```bash
# Voir les logs détaillés
docker-compose -f docker-compose.elk.yml logs elasticsearch

# Rechercher les erreurs
docker-compose -f docker-compose.elk.yml logs elasticsearch | grep -i error
```

## ⚠️ Problème : Filebeat ne collecte pas les logs

### Symptômes
- Aucun log dans Elasticsearch
- Filebeat ne montre pas d'erreurs

### Solutions

#### Solution 1 : Vérifier les permissions Docker

```bash
# Vérifier que Filebeat peut accéder au socket Docker
docker exec elk-filebeat ls -la /var/run/docker.sock

# Vérifier que Filebeat peut accéder aux logs
docker exec elk-filebeat ls -la /var/lib/docker/containers/ | head -5
```

#### Solution 2 : Vérifier la configuration

```bash
# Vérifier la configuration Filebeat
docker exec elk-filebeat cat /usr/share/filebeat/filebeat.yml

# Vérifier les logs Filebeat
docker-compose -f docker-compose.elk.yml logs filebeat
```

#### Solution 3 : Redémarrer Filebeat

```bash
docker-compose -f docker-compose.elk.yml restart filebeat
```

## ⚠️ Problème : Logstash ne traite pas les logs

### Symptômes
- Les logs arrivent dans Elasticsearch mais ne sont pas parsés
- Les champs personnalisés ne sont pas extraits

### Solutions

#### Solution 1 : Vérifier la configuration Logstash

```bash
# Vérifier la configuration
docker exec elk-logstash cat /usr/share/logstash/pipeline/logstash.conf

# Tester la configuration
docker exec elk-logstash /usr/share/logstash/bin/logstash --config.test_and_exit --path.config=/usr/share/logstash/pipeline/logstash.conf
```

#### Solution 2 : Vérifier les logs Logstash

```bash
# Voir les logs
docker-compose -f docker-compose.elk.yml logs logstash

# Rechercher les erreurs de parsing
docker-compose -f docker-compose.elk.yml logs logstash | grep -i "grok\|parse\|error"
```

#### Solution 3 : Redémarrer Logstash

```bash
docker-compose -f docker-compose.elk.yml restart logstash
```

## ⚠️ Problème : Kibana ne se connecte pas à Elasticsearch

### Symptômes
```
[ERROR] Unable to connect to Elasticsearch
```

### Solutions

#### Solution 1 : Vérifier la connectivité réseau

```bash
# Depuis Kibana, tester la connexion à Elasticsearch
docker exec elk-kibana curl http://elasticsearch:9200

# Devrait retourner des informations sur Elasticsearch
```

#### Solution 2 : Vérifier les variables d'environnement

```bash
# Vérifier la configuration
docker exec elk-kibana env | grep ELASTICSEARCH

# Devrait afficher : ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

#### Solution 3 : Vérifier que les services sont sur le même réseau

```bash
# Vérifier les réseaux
docker network inspect gamev2_elk-network

# Vérifier que tous les services sont sur le réseau
docker network inspect gamev2_elk-network | grep -E "elasticsearch|kibana|logstash"
```

## 📊 Commandes utiles de diagnostic

### Vérifier le statut de tous les services

```bash
docker-compose -f docker-compose.elk.yml ps
```

### Voir les logs de tous les services

```bash
docker-compose -f docker-compose.elk.yml logs -f
```

### Vérifier l'utilisation des ressources

```bash
docker stats elk-elasticsearch elk-kibana elk-logstash elk-filebeat
```

### Vérifier les indices Elasticsearch

```bash
curl http://localhost:9200/_cat/indices?v
```

### Vérifier la santé du cluster

```bash
curl http://localhost:9200/_cluster/health?pretty
```

### Rechercher des logs spécifiques

```bash
# Rechercher dans Elasticsearch
curl -X GET "http://localhost:9200/gamev2-logs-*/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "critical_endpoint": "true"
    }
  },
  "size": 10
}'
```

## 🔧 Optimisations de performance

### Réduire la charge d'Elasticsearch

```yaml
# Dans docker-compose.elk.yml, ajouter à Elasticsearch :
environment:
  - "thread_pool.write.size=2"
  - "thread_pool.write.queue_size=100"
  - "refresh_interval=5s"
```

### Réduire la charge de Kibana

```yaml
# Dans docker-compose.elk.yml, ajouter à Kibana :
environment:
  - XPACK_APM_ENABLED=false
  - XPACK_FLEET_ENABLED=false
  - XPACK_ML_ENABLED=false
```

### Augmenter les ressources

Si vous avez plus de RAM disponible :

```yaml
# Elasticsearch
mem_limit: 6g
mem_reservation: 3g
ES_JAVA_OPTS=-Xms3g -Xmx3g

# Kibana
mem_limit: 3g
mem_reservation: 2g
```

## 📝 Notes importantes

- Les timeouts sont normaux au démarrage, surtout sur des machines avec peu de ressources
- Attendez 2-3 minutes après le démarrage avant d'utiliser Kibana
- Vérifiez toujours la santé d'Elasticsearch avant de diagnostiquer Kibana
- Les erreurs "degraded" ne sont pas critiques si Kibana fonctionne

## 🔗 Ressources

- [Documentation Elasticsearch Troubleshooting](https://www.elastic.co/guide/en/elasticsearch/reference/current/troubleshooting.html)
- [Documentation Kibana Troubleshooting](https://www.elastic.co/guide/en/kibana/current/troubleshooting.html)
- [Documentation Logstash Troubleshooting](https://www.elastic.co/guide/en/logstash/current/troubleshooting.html)


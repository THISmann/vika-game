# 🐛 Résoudre les erreurs Kibana

Guide pour résoudre les erreurs courantes dans Kibana.

## ⚠️ Erreur : "Bad Request" - "undefined: undefined"

Cette erreur se produit généralement lors de :
- Création d'un index pattern
- Exécution d'une requête
- Création d'une visualisation

### Solution 1 : Vérifier le format de date

L'erreur peut venir d'un problème avec le champ `@timestamp`.

**Vérification** :
1. Allez dans **Discover**
2. Cliquez sur un document pour voir les champs
3. Vérifiez que `@timestamp` existe et a un format de date valide

**Correction** :
Si `@timestamp` n'existe pas ou est mal formaté :
1. Allez dans **Management** → **Stack Management** → **Index Patterns**
2. Sélectionnez votre index pattern
3. Cliquez sur **Edit**
4. Vérifiez que le **Time field** est bien `@timestamp`
5. Si nécessaire, changez-le pour un autre champ de date

### Solution 2 : Vérifier les champs disponibles

**Vérification** :
```bash
# Voir les champs disponibles dans un index
curl 'http://localhost:9200/gamev2-logs-2025.12.10/_mapping?pretty'
```

**Correction** :
Si les champs attendus n'existent pas :
1. Vérifiez que Filebeat collecte bien les logs
2. Vérifiez que Logstash traite bien les logs
3. Redémarrez les services si nécessaire

### Solution 3 : Recréer l'index pattern

Parfois, l'index pattern est mal configuré :

1. Allez dans **Management** → **Stack Management** → **Index Patterns**
2. Supprimez l'index pattern problématique
3. Recréez-le :
   - **Index pattern** : `gamev2-logs-*`
   - **Time field** : `@timestamp`
   - **Create index pattern**

### Solution 4 : Vérifier les permissions Elasticsearch

**Vérification** :
```bash
# Vérifier la santé du cluster
curl 'http://localhost:9200/_cluster/health?pretty'
```

**Correction** :
Si le cluster est en état "red", il y a un problème avec Elasticsearch :
```bash
# Redémarrer Elasticsearch
docker-compose -f docker-compose.elk.yml restart elasticsearch
```

### Solution 5 : Nettoyer le cache Kibana

1. Redémarrez Kibana :
```bash
docker-compose -f docker-compose.elk.yml restart kibana
```

2. Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)

### Solution 6 : Vérifier les logs Kibana

```bash
# Voir les logs Kibana pour plus de détails
docker-compose -f docker-compose.elk.yml logs kibana | tail -50
```

---

## ⚠️ Erreur : "Index pattern not found"

### Solution

1. Allez dans **Management** → **Stack Management** → **Index Patterns**
2. Vérifiez que l'index pattern existe
3. Si absent, créez-le :
   - **Index pattern** : `gamev2-logs-*`
   - **Time field** : `@timestamp`

---

## ⚠️ Erreur : "No data found"

### Solution

1. Vérifiez que des logs sont collectés :
```bash
# Vérifier les indices
curl 'http://localhost:9200/_cat/indices/gamev2-*?v'
```

2. Vérifiez que Filebeat fonctionne :
```bash
docker-compose -f docker-compose.elk.yml logs filebeat | tail -20
```

3. Vérifiez que Logstash fonctionne :
```bash
docker-compose -f docker-compose.elk.yml logs logstash | tail -20
```

---

## ⚠️ Erreur : "Field not found"

### Solution

1. Allez dans **Discover**
2. Cliquez sur un document pour voir les champs disponibles
3. Utilisez les champs qui existent réellement dans vos logs
4. Si un champ est manquant, vérifiez la configuration Logstash

---

## 🔧 Commandes de diagnostic

### Vérifier les indices

```bash
curl 'http://localhost:9200/_cat/indices/gamev2-*?v'
```

### Vérifier le mapping

```bash
curl 'http://localhost:9200/gamev2-logs-2025.12.10/_mapping?pretty'
```

### Vérifier un document

```bash
curl 'http://localhost:9200/gamev2-logs-2025.12.10/_search?size=1&pretty'
```

### Vérifier la santé du cluster

```bash
curl 'http://localhost:9200/_cluster/health?pretty'
```

---

## 📝 Notes

- Les erreurs "Bad Request" sont souvent dues à des champs manquants ou mal formatés
- Vérifiez toujours que les champs utilisés existent dans vos logs
- Utilisez les champs `.keyword` pour les agrégations (ex: `container_name.keyword`)
- Le champ `@timestamp` doit être de type `date` dans Elasticsearch


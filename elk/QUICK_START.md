# 🚀 Quick Start - ELK Stack

Guide rapide pour démarrer et utiliser le stack ELK.

## ✅ Kibana est maintenant disponible !

Si vous voyez dans les logs :
```
[INFO][status] Kibana is now available
```

Cela signifie que Kibana fonctionne correctement ! 🎉

## 🌐 Accès à Kibana

Ouvrez votre navigateur : **http://localhost:5601**

## ⚠️ Erreurs normales (non bloquantes)

Les erreurs suivantes sont **normales** en développement et n'empêchent pas Kibana de fonctionner :

### 1. Warnings sur les clés de chiffrement
```
[WARN] Generating a random key for xpack.security.encryptionKey
```
**Solution** : Déjà corrigé dans la configuration. Redémarrez Kibana pour appliquer.

### 2. Erreurs de licence Platinum
```
[ERROR] Platinum license or higher is needed
```
**Normal** : Certaines fonctionnalités avancées nécessitent une licence payante. Les fonctionnalités de base (logs, dashboards) fonctionnent sans licence.

### 3. Timeout TaskManager
```
[ERROR] Failed to poll for work: TimeoutError
```
**Normal** : Le TaskManager peut avoir des timeouts occasionnels. Cela n'affecte pas les fonctionnalités principales.

### 4. Erreurs de sécurité
```
[ERROR] no handler found for uri [/_security/user/_has_privileges]
```
**Normal** : La sécurité X-Pack est désactivée, donc certaines routes de sécurité ne sont pas disponibles.

## 📊 Premiers pas dans Kibana

### 1. Créer un index pattern

1. Allez dans **Management** → **Stack Management** → **Index Patterns**
2. Cliquez sur **Create index pattern**
3. Entrez : `gamev2-logs-*`
4. Sélectionnez `@timestamp` comme time field
5. Cliquez sur **Create index pattern**

### 2. Explorer les logs

1. Allez dans **Discover**
2. Sélectionnez l'index pattern `gamev2-logs-*`
3. Vous verrez tous les logs collectés

### 3. Rechercher des logs spécifiques

Dans la barre de recherche, utilisez KQL :

```
# Tous les endpoints critiques
critical_endpoint: true

# Erreurs
log_level: "error"

# Un service spécifique
container_name: "game-service"
```

## 🔍 Vérifier que tout fonctionne

### Vérifier Elasticsearch

```bash
curl http://localhost:9200/_cluster/health?pretty
```

Devrait retourner `"status" : "green"` ou `"yellow"`

### Vérifier les indices

```bash
curl http://localhost:9200/_cat/indices?v
```

Vous devriez voir des indices comme :
- `gamev2-logs-2025.12.10`
- `.kibana_*`

### Vérifier Kibana

```bash
curl http://localhost:5601/api/status
```

Devrait retourner un JSON avec `"status":{"overall":{"level":"available"}}`

## 🎯 Prochaines étapes

1. ✅ Kibana est accessible sur http://localhost:5601
2. 📊 Créer des index patterns pour vos logs
3. 📈 Créer des dashboards pour visualiser les métriques
4. 🔔 Configurer des alertes (optionnel)

## 📝 Notes

- Les erreurs de licence et de sécurité sont **normales** en développement
- Kibana peut être en état "degraded" au démarrage, puis passer à "available"
- Attendez 2-3 minutes après le démarrage avant d'utiliser Kibana
- Les fonctionnalités de base (logs, dashboards, visualisations) fonctionnent sans licence payante

## 🆘 Besoin d'aide ?

Consultez :
- `elk/README.md` - Documentation complète
- `elk/TROUBLESHOOTING.md` - Guide de dépannage
- `docs/ELK_DOCKER_COMPOSE_GUIDE.md` - Guide détaillé


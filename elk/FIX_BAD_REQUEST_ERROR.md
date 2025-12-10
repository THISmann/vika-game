# 🐛 Résoudre l'erreur "Bad Request" dans Kibana

Guide pour résoudre l'erreur `"Bad Request"` avec le message `"undefined: undefined"` dans Kibana.

## 🔍 Diagnostic

Cette erreur se produit généralement lors de :
- Création d'un index pattern
- Exécution d'une requête dans Discover
- Création d'une visualisation
- Ouverture d'un dashboard

## ✅ Solutions

### Solution 1 : Recréer l'index pattern (Recommandé)

L'erreur vient souvent d'un index pattern mal configuré.

**Étapes** :

1. **Ouvrez Kibana** : http://localhost:5601

2. **Supprimez l'index pattern existant** :
   - Allez dans **Management** → **Stack Management** → **Index Patterns**
   - Trouvez `gamev2-logs-*` (ou l'index pattern problématique)
   - Cliquez sur l'index pattern
   - Cliquez sur **Delete** (en haut à droite)
   - Confirmez la suppression

3. **Recréez l'index pattern** :
   - Cliquez sur **Create index pattern**
   - **Step 1** : Entrez `gamev2-logs-*`
   - Cliquez sur **Next step**
   - **Step 2** : 
     - **Time field** : Sélectionnez `@timestamp` dans la liste déroulante
     - ⚠️ **Important** : Si `@timestamp` n'apparaît pas, essayez de rafraîchir la page ou attendez quelques secondes
   - Cliquez sur **Create index pattern**

4. **Vérifiez** :
   - L'index pattern devrait maintenant être créé sans erreur
   - Vous devriez voir le nombre de documents indexés

### Solution 2 : Vérifier le format de date

Si `@timestamp` n'est pas reconnu comme champ de date :

1. Vérifiez dans **Discover** :
   - Allez dans **Analytics** → **Discover**
   - Sélectionnez l'index pattern `gamev2-logs-*`
   - Cliquez sur un document pour voir les champs
   - Vérifiez que `@timestamp` existe et a un format de date

2. Si `@timestamp` n'existe pas, utilisez un autre champ :
   - Cherchez un champ de type `date` dans la liste
   - Utilisez ce champ comme **Time field**

### Solution 3 : Vider le cache du navigateur

Parfois, le cache du navigateur cause des problèmes :

1. **Chrome/Edge** : `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
2. **Firefox** : `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)
3. Ou ouvrez Kibana en navigation privée

### Solution 4 : Redémarrer Kibana

```bash
docker-compose -f docker-compose.elk.yml restart kibana
```

Attendez 1-2 minutes que Kibana redémarre, puis réessayez.

### Solution 5 : Vérifier les champs utilisés

Si l'erreur se produit lors d'une requête ou visualisation :

1. **Vérifiez que les champs existent** :
   - Allez dans **Discover**
   - Cliquez sur un document
   - Vérifiez que les champs utilisés (ex: `container_name`, `log_level`, etc.) existent

2. **Utilisez les champs `.keyword` pour les agrégations** :
   - Au lieu de `container_name`, utilisez `container_name.keyword`
   - Au lieu de `endpoint_type`, utilisez `endpoint_type.keyword`
   - Au lieu de `log_level`, utilisez `log_level.keyword`

### Solution 6 : Vérifier la configuration Logstash

Si les champs personnalisés ne sont pas extraits :

1. Vérifiez les logs Logstash :
```bash
docker-compose -f docker-compose.elk.yml logs logstash | tail -50
```

2. Vérifiez la configuration :
```bash
docker exec elk-logstash cat /usr/share/logstash/pipeline/logstash.conf
```

3. Si nécessaire, redémarrez Logstash :
```bash
docker-compose -f docker-compose.elk.yml restart logstash
```

## 🔧 Vérifications rapides

### Vérifier que les indices existent

```bash
curl 'http://localhost:9200/_cat/indices/gamev2-logs-*?v'
```

### Vérifier le mapping (champs disponibles)

```bash
curl 'http://localhost:9200/gamev2-logs-2025.12.10/_mapping?pretty' | grep -A 3 "@timestamp"
```

### Vérifier un document exemple

```bash
curl 'http://localhost:9200/gamev2-logs-2025.12.10/_search?size=1&pretty'
```

## 📝 Checklist de résolution

- [ ] Index pattern supprimé et recréé
- [ ] Time field configuré correctement (`@timestamp`)
- [ ] Cache du navigateur vidé
- [ ] Kibana redémarré
- [ ] Champs utilisés existent dans les logs
- [ ] Champs `.keyword` utilisés pour les agrégations
- [ ] Logstash fonctionne correctement

## 🆘 Si le problème persiste

1. **Vérifiez les logs Kibana** :
```bash
docker-compose -f docker-compose.elk.yml logs kibana | grep -i error | tail -20
```

2. **Vérifiez les logs Elasticsearch** :
```bash
docker-compose -f docker-compose.elk.yml logs elasticsearch | grep -i error | tail -20
```

3. **Vérifiez la santé du cluster** :
```bash
curl 'http://localhost:9200/_cluster/health?pretty'
```

4. **Consultez le guide complet** : `elk/FIX_KIBANA_ERRORS.md`

## 💡 Astuces

- **Utilisez toujours les champs `.keyword`** pour les agrégations (Terms, Filters, etc.)
- **Vérifiez toujours que les champs existent** avant de les utiliser dans une visualisation
- **Le time picker** doit être configuré pour voir les données récentes
- **Les index patterns** doivent correspondre exactement aux noms d'indices (ex: `gamev2-logs-*`)


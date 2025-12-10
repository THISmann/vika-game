# 📋 Guide étape par étape : Créer un index pattern dans Kibana

Guide détaillé avec captures d'écran pour créer un index pattern sans erreur.

## 🎯 Objectif

Créer un index pattern `gamev2-logs-*` avec le champ `@timestamp` comme time field.

## 📝 Étapes détaillées

### Étape 1 : Accéder à Kibana

1. Ouvrez votre navigateur
2. Allez sur : http://localhost:5601
3. Attendez que Kibana charge complètement

### Étape 2 : Accéder à la gestion des index patterns

1. Cliquez sur le **menu hamburger** (☰) en haut à gauche
2. Dans le menu, cliquez sur **Management**
3. Dans le sous-menu, cliquez sur **Stack Management**
4. Dans le menu de gauche, cliquez sur **Index Patterns**

### Étape 3 : Supprimer l'index pattern existant (si présent)

Si vous voyez un index pattern `gamev2-logs-*` :

1. Cliquez dessus pour l'ouvrir
2. Cliquez sur le bouton **Delete** (en haut à droite, souvent en rouge)
3. Confirmez la suppression en tapant le nom de l'index pattern
4. Cliquez sur **Delete**

### Étape 4 : Créer un nouvel index pattern

1. Cliquez sur le bouton **Create index pattern** (en haut à droite)

2. **Step 1 of 2: Define index pattern** :
   - Dans le champ **Index pattern name**, tapez : `gamev2-logs-*`
   - ⚠️ **Important** : Utilisez exactement `gamev2-logs-*` (avec l'astérisque)
   - Cliquez sur **Next step**

3. **Step 2 of 2: Configure settings** :
   - **Time field** : Dans la liste déroulante, sélectionnez `@timestamp`
   - ⚠️ **Si `@timestamp` n'apparaît pas** :
     - Attendez quelques secondes
     - Rafraîchissez la page (F5)
     - Ou vérifiez qu'il y a des documents dans les indices
   - Cliquez sur **Create index pattern**

### Étape 5 : Vérifier la création

Vous devriez voir :
- ✅ Un message de succès
- Le nombre de documents indexés
- La liste des champs disponibles

## 🔍 Vérification

### Vérifier dans Discover

1. Allez dans **Analytics** → **Discover**
2. Dans le sélecteur d'index pattern (en haut à gauche), sélectionnez `gamev2-logs-*`
3. Vous devriez voir des logs s'afficher

### Vérifier les champs disponibles

1. Dans **Discover**, cliquez sur un document pour l'ouvrir
2. Vous devriez voir tous les champs disponibles :
   - `@timestamp` (date)
   - `message` (text)
   - `container_name` (text)
   - `log_level` (text)
   - `critical_endpoint` (boolean)
   - etc.

## ⚠️ Problèmes courants

### Problème 1 : "No matching indices found"

**Cause** : Aucun index ne correspond au pattern

**Solution** :
1. Vérifiez que les indices existent :
```bash
curl 'http://localhost:9200/_cat/indices/gamev2-logs-*?v'
```

2. Si aucun index n'existe, attendez que Filebeat collecte des logs

### Problème 2 : "@timestamp not found"

**Cause** : Le champ `@timestamp` n'existe pas dans les documents

**Solution** :
1. Vérifiez un document :
```bash
curl 'http://localhost:9200/gamev2-logs-2025.12.10/_search?size=1&pretty'
```

2. Si `@timestamp` n'existe pas, utilisez un autre champ de date ou vérifiez la configuration Logstash

### Problème 3 : Erreur "Bad Request"

**Cause** : Index pattern mal configuré

**Solution** :
1. Supprimez l'index pattern
2. Recréez-le en suivant exactement les étapes ci-dessus
3. Videz le cache du navigateur (Ctrl+Shift+R)

## 📊 Créer les autres index patterns

Répétez les étapes pour :

- `gamev2-errors-*` → Time field : `@timestamp`
- `gamev2-critical-*` → Time field : `@timestamp`
- `gamev2-websocket-*` → Time field : `@timestamp`

## ✅ Checklist

- [ ] Index pattern `gamev2-logs-*` créé
- [ ] Time field configuré sur `@timestamp`
- [ ] Index pattern visible dans Discover
- [ ] Documents visibles dans Discover
- [ ] Champs disponibles visibles

## 🆘 Besoin d'aide ?

Consultez :
- `elk/FIX_BAD_REQUEST_ERROR.md` - Guide de résolution des erreurs
- `elk/FIX_KIBANA_ERRORS.md` - Guide général de dépannage
- `elk/KIBANA_VISUALIZATION_GUIDE.md` - Guide de visualisation


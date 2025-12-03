# Correction des problèmes MongoDB

## 🔍 Problèmes identifiés

1. **Authentification MongoDB requise** : Les services essaient de se connecter sans credentials alors que MongoDB a été configuré avec authentification
2. **GameState _id invalide** : Le modèle GameState utilise `_id: 'current'` qui n'est pas un ObjectId valide

## ✅ Corrections appliquées

### 1. Désactivation de l'authentification MongoDB

Le déploiement MongoDB a été modifié pour ne plus utiliser les credentials, ce qui désactive l'authentification automatiquement.

**Fichier modifié** : `k8s/mongodb-deployment.yaml`
- Suppression des variables `MONGO_INITDB_ROOT_USERNAME` et `MONGO_INITDB_ROOT_PASSWORD`
- MongoDB fonctionne maintenant sans authentification (développement)

### 2. Correction du modèle GameState

Le modèle GameState utilise maintenant un champ `key` au lieu de `_id` pour identifier le document unique.

**Fichier modifié** : `node/game-service/models/GameState.js`
- Ajout d'un champ `key` avec valeur par défaut `'current'`
- Les méthodes `getCurrent()` et `updateCurrent()` utilisent maintenant `{ key: 'current' }` au lieu de `{ _id: 'current' }`

## 🚀 Application des corrections

### Option 1: Script automatique (recommandé)

```bash
./fix-mongodb-auth.sh
```

Ce script :
1. Met à jour le déploiement MongoDB
2. Redémarre MongoDB
3. Redémarre tous les micro-services
4. Vérifie que tout fonctionne

### Option 2: Manuel

1. **Mettre à jour MongoDB** :
   ```bash
   kubectl apply -f k8s/mongodb-deployment.yaml
   kubectl rollout restart deployment/mongodb -n intelectgame
   ```

2. **Rebuild et redéployer game-service** (pour le nouveau modèle) :
   ```bash
   # Sur votre machine locale
   cd node/game-service
   docker build -t thismann17/gamev2-game-service:latest .
   docker push thismann17/gamev2-game-service:latest
   
   # Sur le serveur
   kubectl rollout restart deployment/game-service -n intelectgame
   ```

3. **Redémarrer tous les services** :
   ```bash
   kubectl rollout restart deployment/auth-service -n intelectgame
   kubectl rollout restart deployment/quiz-service -n intelectgame
   kubectl rollout restart deployment/game-service -n intelectgame
   ```

## 🔍 Vérification

Après avoir appliqué les corrections :

```bash
# 1. Vérifier que MongoDB fonctionne sans auth
kubectl logs -n intelectgame deployment/mongodb | tail -20

# 2. Vérifier que les services se connectent
kubectl logs -n intelectgame deployment/auth-service | grep MongoDB
kubectl logs -n intelectgame deployment/quiz-service | grep MongoDB
kubectl logs -n intelectgame deployment/game-service | grep MongoDB

# 3. Tester les endpoints
./test-all-endpoints.sh http://82.202.141.248
```

Vous devriez voir :
- `✅ MongoDB connected (service-name)` dans les logs
- Plus d'erreurs `Command requires authentication`
- Les endpoints retournent 200 au lieu de 500

## ⚠️ Important

**Pour la production**, réactivez l'authentification MongoDB :

1. Remettez les variables d'environnement dans `mongodb-deployment.yaml`
2. Mettez à jour le ConfigMap avec l'URI avec credentials :
   ```yaml
   MONGODB_URI: "mongodb://admin:VOTRE_MOT_DE_PASSE@mongodb:27017/intelectgame?authSource=admin"
   ```
3. Redéployez tout

## 📝 Notes

- Les données MongoDB existantes ne seront pas perdues (PVC persistant)
- Le changement de modèle GameState nécessite un rebuild de l'image Docker
- Tous les services doivent être redémarrés pour prendre en compte les changements


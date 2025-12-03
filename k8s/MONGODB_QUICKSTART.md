# MongoDB - Guide de démarrage rapide

## 🚀 Déploiement rapide

### Option 1: Déploiement complet (recommandé)

Déploie MongoDB et tous les services en une seule commande :

```bash
./k8s/deploy-all-with-mongodb.sh
```

### Option 2: Déploiement séparé

1. Déployer MongoDB uniquement :
   ```bash
   ./k8s/deploy-mongodb.sh
   ```

2. Vérifier que MongoDB fonctionne :
   ```bash
   ./k8s/verify-mongodb.sh
   ```

3. Déployer les autres services :
   ```bash
   kubectl apply -f k8s/all-services.yaml
   ```

## ✅ Vérification

### Vérifier que MongoDB est prêt

```bash
# Statut du pod
kubectl get pods -n intelectgame -l app=mongodb

# Logs
kubectl logs -n intelectgame deployment/mongodb

# Service
kubectl get svc -n intelectgame mongodb
```

### Vérifier que les services se connectent à MongoDB

```bash
# Auth Service
kubectl logs -n intelectgame deployment/auth-service | grep MongoDB

# Quiz Service
kubectl logs -n intelectgame deployment/quiz-service | grep MongoDB

# Game Service
kubectl logs -n intelectgame deployment/game-service | grep MongoDB
```

Vous devriez voir : `✅ MongoDB connected (service-name)`

## 🔧 Configuration

### URI MongoDB

Les services utilisent automatiquement :
```
mongodb://mongodb:27017/intelectgame
```

Cette URI est configurée dans le ConfigMap `app-config`.

### Modifier l'URI MongoDB

Si vous devez changer l'URI :

```bash
kubectl patch configmap app-config -n intelectgame --type merge -p '{"data":{"MONGODB_URI":"mongodb://nouvelle-uri"}}'

# Redémarrer les services
kubectl rollout restart deployment/auth-service -n intelectgame
kubectl rollout restart deployment/quiz-service -n intelectgame
kubectl rollout restart deployment/game-service -n intelectgame
```

## 🗄️ Accéder à MongoDB

### Se connecter à MongoDB

```bash
# Obtenir le nom du pod
POD_NAME=$(kubectl get pods -n intelectgame -l app=mongodb -o jsonpath='{.items[0].metadata.name}')

# Se connecter
kubectl exec -it -n intelectgame $POD_NAME -- mongosh intelectgame
```

### Commandes MongoDB utiles

```javascript
// Lister les collections
show collections

// Voir les utilisateurs
db.users.find().pretty()

// Voir les questions
db.questions.find().pretty()

// Voir les scores
db.scores.find().pretty()

// Voir l'état du jeu
db.gamestate.find().pretty()

// Compter les documents
db.users.countDocuments()
db.questions.countDocuments()
```

## 🐛 Dépannage rapide

### MongoDB ne démarre pas

```bash
# Voir les logs
kubectl logs -n intelectgame deployment/mongodb

# Voir les événements
kubectl describe pod -n intelectgame -l app=mongodb
```

### Services ne peuvent pas se connecter

1. Vérifier que MongoDB est en cours d'exécution :
   ```bash
   kubectl get pods -n intelectgame -l app=mongodb
   ```

2. Vérifier que le service MongoDB existe :
   ```bash
   kubectl get svc -n intelectgame mongodb
   ```

3. Vérifier le ConfigMap :
   ```bash
   kubectl get configmap app-config -n intelectgame -o yaml
   ```

4. Redémarrer les services :
   ```bash
   kubectl rollout restart deployment/auth-service -n intelectgame
   kubectl rollout restart deployment/quiz-service -n intelectgame
   kubectl rollout restart deployment/game-service -n intelectgame
   ```

## 📚 Documentation complète

Pour plus de détails, consultez : `k8s/MONGODB_DEPLOYMENT.md`


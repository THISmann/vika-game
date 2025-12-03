# Déploiement MongoDB sur Kubernetes (Minikube)

## 📋 Vue d'ensemble

Ce guide explique comment déployer MongoDB sur Minikube pour l'application IntelectGame.

## 🏗️ Architecture

- **Image Docker**: `mongo:7.0` (image officielle)
- **Storage**: PersistentVolumeClaim (5Gi) pour la persistance des données
- **Service**: ClusterIP (accès interne uniquement)
- **Namespace**: `intelectgame`

## 🚀 Déploiement rapide

### 1. Déployer MongoDB

```bash
./k8s/deploy-mongodb.sh
```

Ce script :
- Crée le namespace `intelectgame` si nécessaire
- Déploie MongoDB avec PersistentVolumeClaim
- Configure les secrets et ConfigMaps
- Attend que MongoDB soit prêt

### 2. Vérifier le déploiement

```bash
./k8s/verify-mongodb.sh
```

### 3. Mettre à jour les services existants

Si vous avez déjà déployé les micro-services, mettez-les à jour :

```bash
./k8s/update-deployments-for-mongodb.sh
```

## 📝 Déploiement manuel

### Étape 1: Créer le namespace

```bash
kubectl create namespace intelectgame
```

### Étape 2: Déployer MongoDB

```bash
kubectl apply -f k8s/mongodb-deployment.yaml
```

### Étape 3: Vérifier le statut

```bash
kubectl get pods -n intelectgame -l app=mongodb
kubectl get svc -n intelectgame mongodb
kubectl get pvc -n intelectgame mongodb-pvc
```

## 🔧 Configuration

### Variables d'environnement MongoDB

- `MONGO_INITDB_DATABASE`: `intelectgame`
- `MONGO_INITDB_ROOT_USERNAME`: `admin` (depuis Secret)
- `MONGO_INITDB_ROOT_PASSWORD`: `admin123` (depuis Secret)

### URI de connexion

Les micro-services utilisent :
```
mongodb://mongodb:27017/intelectgame
```

Pour utiliser l'authentification (recommandé en production) :
```
mongodb://admin:admin123@mongodb:27017/intelectgame?authSource=admin
```

## 📊 Ressources

### PersistentVolumeClaim
- **Taille**: 5Gi
- **StorageClass**: `standard` (Minikube)
- **AccessMode**: ReadWriteOnce

### Ressources du pod MongoDB
- **Memory**: 256Mi (request), 512Mi (limit)
- **CPU**: 250m (request), 500m (limit)

## 🔍 Vérification et dépannage

### Vérifier les logs

```bash
kubectl logs -n intelectgame deployment/mongodb
```

### Accéder à MongoDB

```bash
# Obtenir le nom du pod
POD_NAME=$(kubectl get pods -n intelectgame -l app=mongodb -o jsonpath='{.items[0].metadata.name}')

# Se connecter à MongoDB
kubectl exec -it -n intelectgame $POD_NAME -- mongosh intelectgame
```

### Commandes MongoDB utiles

```javascript
// Lister les bases de données
show dbs

// Utiliser la base de données
use intelectgame

// Lister les collections
show collections

// Compter les documents
db.users.countDocuments()
db.questions.countDocuments()
db.scores.countDocuments()
```

### Vérifier la connexion depuis un service

```bash
# Vérifier que auth-service se connecte à MongoDB
kubectl logs -n intelectgame deployment/auth-service | grep MongoDB

# Devrait afficher: ✅ MongoDB connected (auth-service)
```

## 🐛 Dépannage

### Pod MongoDB en CrashLoopBackOff

1. Vérifier les logs :
   ```bash
   kubectl logs -n intelectgame deployment/mongodb
   ```

2. Vérifier les événements :
   ```bash
   kubectl describe pod -n intelectgame -l app=mongodb
   ```

3. Vérifier le PVC :
   ```bash
   kubectl get pvc -n intelectgame mongodb-pvc
   kubectl describe pvc -n intelectgame mongodb-pvc
   ```

### Services ne peuvent pas se connecter à MongoDB

1. Vérifier que le service MongoDB existe :
   ```bash
   kubectl get svc -n intelectgame mongodb
   ```

2. Vérifier que le ConfigMap contient MONGODB_URI :
   ```bash
   kubectl get configmap -n intelectgame app-config -o yaml
   ```

3. Tester la connexion depuis un pod de service :
   ```bash
   kubectl exec -it -n intelectgame deployment/auth-service -- sh
   # Dans le pod:
   echo $MONGODB_URI
   ```

### PVC ne se monte pas

Sur Minikube, assurez-vous que le storage provisioner est actif :

```bash
minikube addons enable storage-provisioner
minikube addons enable default-storageclass
```

## 🔐 Sécurité (Production)

### Activer l'authentification

1. Modifier `k8s/mongodb-deployment.yaml` :
   ```yaml
   security:
     authorization: enabled
   ```

2. Mettre à jour le ConfigMap avec l'URI avec authentification :
   ```yaml
   MONGODB_URI: "mongodb://admin:VOTRE_MOT_DE_PASSE@mongodb:27017/intelectgame?authSource=admin"
   ```

3. Utiliser un Secret pour le mot de passe :
   ```bash
   kubectl create secret generic mongodb-secret \
     --from-literal=username=admin \
     --from-literal=password=VOTRE_MOT_DE_PASSE_SECURISE \
     -n intelectgame
   ```

## 📦 Migration des données

Si vous avez des données dans les fichiers JSON et souhaitez les migrer :

1. Créer un script de migration qui lit les JSON
2. Se connecter à MongoDB dans Kubernetes
3. Insérer les données via `mongosh` ou un script Node.js

## 🗑️ Suppression

Pour supprimer MongoDB :

```bash
kubectl delete -f k8s/mongodb-deployment.yaml
```

⚠️ **Attention**: Cela supprimera aussi le PVC et toutes les données MongoDB !

Pour conserver les données, supprimez seulement le Deployment et le Service :

```bash
kubectl delete deployment mongodb -n intelectgame
kubectl delete svc mongodb -n intelectgame
# Gardez le PVC pour conserver les données
```

## 📚 Ressources supplémentaires

- [MongoDB Kubernetes Operator](https://www.mongodb.com/kubernetes-operator)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Kubernetes PersistentVolumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)


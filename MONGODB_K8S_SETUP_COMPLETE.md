# ✅ Configuration MongoDB pour Kubernetes - Terminée

## 📦 Fichiers créés

### 1. Déploiement MongoDB
- **`k8s/mongodb-deployment.yaml`** : Déploiement complet de MongoDB avec :
  - PersistentVolumeClaim (5Gi) pour la persistance
  - Service ClusterIP pour l'accès interne
  - Secrets pour les credentials
  - Health checks (liveness/readiness probes)

### 2. Scripts de déploiement
- **`k8s/deploy-mongodb.sh`** : Déploie uniquement MongoDB
- **`k8s/verify-mongodb.sh`** : Vérifie que MongoDB fonctionne
- **`k8s/update-deployments-for-mongodb.sh`** : Met à jour les services existants
- **`k8s/deploy-all-with-mongodb.sh`** : Déploie tout (MongoDB + services)

### 3. Documentation
- **`k8s/MONGODB_DEPLOYMENT.md`** : Guide complet de déploiement
- **`k8s/MONGODB_QUICKSTART.md`** : Guide de démarrage rapide

## 🚀 Utilisation

### Déploiement rapide

```bash
# Option 1: Tout déployer d'un coup (recommandé)
./k8s/deploy-all-with-mongodb.sh

# Option 2: Déployer MongoDB puis les services
./k8s/deploy-mongodb.sh
kubectl apply -f k8s/all-services.yaml
```

### Vérification

```bash
# Vérifier MongoDB
./k8s/verify-mongodb.sh

# Vérifier les logs des services
kubectl logs -n intelectgame deployment/auth-service | grep MongoDB
kubectl logs -n intelectgame deployment/quiz-service | grep MongoDB
kubectl logs -n intelectgame deployment/game-service | grep MongoDB
```

## 🔧 Configuration

### URI MongoDB

Les micro-services utilisent automatiquement :
```
mongodb://mongodb:27017/intelectgame
```

Cette URI est configurée dans le ConfigMap `app-config` et est injectée dans chaque service via `envFrom`.

### Structure MongoDB

Les collections créées automatiquement :
- `users` - Utilisateurs (auth-service)
- `questions` - Questions (quiz-service)
- `gamestate` - État du jeu (game-service)
- `scores` - Scores des joueurs (game-service)

## 📊 Ressources

### PersistentVolumeClaim
- **Taille** : 5Gi
- **StorageClass** : `standard` (Minikube)
- **AccessMode** : ReadWriteOnce

### Pod MongoDB
- **Image** : `mongo:7.0`
- **Memory** : 256Mi (request), 512Mi (limit)
- **CPU** : 250m (request), 500m (limit)

## ✅ Checklist de déploiement

- [x] Déploiement MongoDB avec PVC
- [x] Service ClusterIP pour MongoDB
- [x] ConfigMap avec MONGODB_URI
- [x] Secrets pour credentials MongoDB
- [x] Health checks (liveness/readiness)
- [x] Scripts de déploiement automatisés
- [x] Documentation complète
- [x] Intégration avec les micro-services existants

## 🎯 Prochaines étapes

1. **Déployer** : Exécutez `./k8s/deploy-all-with-mongodb.sh`
2. **Vérifier** : Exécutez `./k8s/verify-mongodb.sh`
3. **Tester** : Vérifiez que les services se connectent à MongoDB
4. **Utiliser** : Les données sont maintenant stockées dans MongoDB !

## 📝 Notes importantes

- Les données MongoDB sont persistantes grâce au PVC
- MongoDB est accessible uniquement depuis le cluster (ClusterIP)
- Les credentials par défaut sont `admin/admin123` (changez-les en production !)
- L'authentification MongoDB est désactivée par défaut (activez-la en production)


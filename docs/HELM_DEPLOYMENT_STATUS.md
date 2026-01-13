# État du Déploiement Helm

## ✅ Déploiement réussi

Les Deployments ont été créés avec succès via Helm :

- ✅ `auth-service` - Deployment créé
- ✅ `quiz-service` - Deployment créé  
- ✅ `game-service` - Deployment créé
- ✅ `frontend` - Deployment créé
- ✅ `telegram-bot` - Deployment créé

## 📋 Commandes de vérification

### Voir tous les Deployments
```bash
kubectl get deployments -n intelectgame
```

### Voir tous les pods
```bash
kubectl get pods -n intelectgame
```

### Voir tous les services
```bash
kubectl get services -n intelectgame
```

### Voir la release Helm
```bash
helm list -n intelectgame
helm status app -n intelectgame
```

### Voir les logs d'un pod
```bash
kubectl logs <pod-name> -n intelectgame
```

### Décrire un pod (pour voir les erreurs)
```bash
kubectl describe pod <pod-name> -n intelectgame
```

## 🔍 Scripts de diagnostic

### Vérifier l'état complet
```bash
./k8s/local/scripts/check-deployments.sh
```

### Diagnostiquer les pods
```bash
./k8s/local/scripts/diagnose-pods.sh
```

## 📝 Notes

- Les pods peuvent prendre quelques minutes pour démarrer
- Si les pods restent en `ContainerCreating`, vérifiez les événements : `kubectl get events -n intelectgame`
- Les images Docker doivent être présentes dans Minikube (construites avec `build-local-images.sh`)



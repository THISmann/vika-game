# Quick Start - Déploiement Local avec Helm

## 🚀 Déploiement en 3 étapes

```bash
# 1. Configurer Minikube
./k8s/local/scripts/setup-minikube.sh

# 2. Construire les images locales
./k8s/local/scripts/build-local-images.sh

# 3. Déployer avec Helm
./k8s/local/scripts/deploy-local.sh
```

## 📋 Vérification

```bash
# Voir tous les pods
kubectl get pods --all-namespaces

# Voir les services
kubectl get svc --all-namespaces

# Voir les releases Helm
helm list --all-namespaces
```

## 🔧 Commandes utiles

### Accès aux services

```bash
# Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Ouvrir http://localhost:3000 (admin/admin)

# Kibana
kubectl port-forward -n elk svc/kibana 5601:5601
# Ouvrir http://localhost:5601

# Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Ouvrir http://localhost:9090
```

### Versioning avec Helm

```bash
# Voir l'historique
helm history app -n intelectgame

# Rollback
helm rollback app <revision> -n intelectgame

# Mettre à jour
helm upgrade app k8s/local/helm/app -n intelectgame
```

### Logs

```bash
# Logs d'un service
kubectl logs -n intelectgame -l app=auth-service

# Logs en temps réel
kubectl logs -f -n intelectgame -l app=game-service
```

## 🧹 Nettoyage

```bash
./k8s/local/scripts/cleanup.sh
```



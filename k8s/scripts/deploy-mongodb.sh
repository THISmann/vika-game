#!/bin/bash

# Script pour déployer MongoDB sur Minikube
# Usage: ./k8s/deploy-mongodb.sh

set -e

echo "🚀 Déploiement de MongoDB sur Minikube..."
echo ""

# Vérifier que Minikube est démarré
if ! minikube status &>/dev/null; then
  echo "❌ Minikube n'est pas démarré. Démarrez-le avec: minikube start"
  exit 1
fi

echo "✅ Minikube est démarré"
echo ""

# Créer le namespace s'il n'existe pas
echo "📦 Création du namespace 'intelectgame'..."
kubectl create namespace intelectgame 2>/dev/null || echo "   Namespace existe déjà"
echo ""

# Déployer MongoDB
echo "🐳 Déploiement de MongoDB..."
kubectl apply -f k8s/mongodb-deployment.yaml

echo ""
echo "⏳ Attente que MongoDB soit prêt..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n intelectgame || {
  echo "⚠️  MongoDB prend plus de temps que prévu. Vérifiez les logs:"
  echo "   kubectl logs -n intelectgame deployment/mongodb"
  exit 1
}

echo ""
echo "✅ MongoDB est déployé et prêt!"
echo ""

# Afficher le statut
echo "📊 Statut de MongoDB:"
kubectl get pods -n intelectgame -l app=mongodb
echo ""

# Afficher les services
echo "🔗 Service MongoDB:"
kubectl get svc -n intelectgame mongodb
echo ""

# Afficher le PVC
echo "💾 PersistentVolumeClaim:"
kubectl get pvc -n intelectgame mongodb-pvc
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ MongoDB est déployé avec succès!"
echo ""
echo "📝 Informations importantes:"
echo "   - URI MongoDB: mongodb://mongodb:27017/intelectgame"
echo "   - Namespace: intelectgame"
echo "   - Service: mongodb (ClusterIP)"
echo ""
echo "🔍 Pour vérifier les logs:"
echo "   kubectl logs -n intelectgame deployment/mongodb"
echo ""
echo "🔍 Pour accéder à MongoDB (depuis un pod):"
echo "   kubectl exec -it -n intelectgame deployment/mongodb -- mongosh intelectgame"
echo ""
echo "📝 Pour connecter les micro-services, utilisez:"
echo "   MONGODB_URI=mongodb://mongodb:27017/intelectgame"
echo "═══════════════════════════════════════════════════════════"


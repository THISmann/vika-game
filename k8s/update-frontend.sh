#!/bin/bash

# Script pour reconstruire et redéployer le frontend après modifications
# Usage: ./k8s/update-frontend.sh

set -e

echo "🔄 Mise à jour du frontend..."

# Activer le Docker daemon de Minikube
eval $(minikube docker-env)

# Reconstruire l'image frontend
echo "🔨 Reconstruction de l'image frontend..."
docker build -t thismann17/gamev2-frontend:latest ./vue

# Redémarrer le déploiement frontend
echo "📦 Redéploiement du frontend..."
kubectl rollout restart deployment/frontend -n intelectgame

# Attendre que le pod soit prêt
echo "⏳ Attente du redémarrage..."
kubectl rollout status deployment/frontend -n intelectgame --timeout=120s

echo "✅ Frontend mis à jour!"
echo ""
echo "📊 Statut:"
kubectl get pods -n intelectgame | grep frontend


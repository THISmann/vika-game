#!/bin/bash

# Script pour construire les images Docker et déployer sur minikube

set -e

echo "🚀 Démarrage du déploiement IntelectGame sur minikube..."

# Vérifier que minikube est démarré
if ! minikube status &> /dev/null; then
    echo "❌ Minikube n'est pas démarré. Démarrage de minikube..."
    minikube start
fi

# Activer le Docker daemon de minikube
echo "📦 Configuration de l'environnement Docker de minikube..."
eval $(minikube docker-env)

# Construire les images
echo "🔨 Construction des images Docker..."

echo "  - Construction de auth-service..."
docker build -t auth-service:latest ./node/auth-service

echo "  - Construction de quiz-service..."
docker build -t quiz-service:latest ./node/quiz-service

echo "  - Construction de game-service..."
docker build -t game-service:latest ./node/game-service

echo "  - Construction de frontend..."
docker build -t frontend:latest ./vue

# Déployer sur Kubernetes
echo "🚀 Déploiement sur Kubernetes..."
kubectl apply -f k8s/all-services.yaml

# Attendre que les pods soient prêts
echo "⏳ Attente du démarrage des pods..."
kubectl wait --for=condition=ready pod -l app=mongodb -n intelectgame --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=auth-service -n intelectgame --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=quiz-service -n intelectgame --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=game-service -n intelectgame --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=frontend -n intelectgame --timeout=120s || true

echo "✅ Déploiement terminé!"
echo ""
echo "📊 Statut des pods:"
kubectl get pods -n intelectgame

echo ""
echo "🌐 Pour accéder à l'application:"
echo "   minikube service frontend -n intelectgame --url"
echo ""
echo "   Ou directement: http://\$(minikube ip):30080"


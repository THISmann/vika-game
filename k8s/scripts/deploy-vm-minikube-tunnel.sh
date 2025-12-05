#!/bin/bash

# Script pour exposer l'application via minikube tunnel
# Usage: ./k8s/deploy-vm-minikube-tunnel.sh

set -e

echo "🌐 Configuration de l'exposition publique via minikube tunnel..."

# Vérifier que les services sont déployés
if ! kubectl get service frontend -n intelectgame &> /dev/null; then
    echo "❌ Les services ne sont pas déployés. Exécutez d'abord ./k8s/deploy-vm.sh"
    exit 1
fi

# Changer les services NodePort en LoadBalancer pour minikube tunnel
echo "📝 Configuration des services en LoadBalancer..."

# Frontend
kubectl patch service frontend -n intelectgame -p '{"spec":{"type":"LoadBalancer"}}'

echo "✅ Services configurés en LoadBalancer"
echo ""
echo "🚀 Démarrage de minikube tunnel..."
echo "   Les services seront accessibles via les IPs LoadBalancer"
echo "   Appuyez sur Ctrl+C pour arrêter"
echo ""

minikube tunnel


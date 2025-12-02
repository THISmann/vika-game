#!/bin/bash

# Script pour supprimer le déploiement
# Usage: ./k8s/undeploy.sh

set -e

echo "🗑️  Suppression du déploiement..."

read -p "Êtes-vous sûr de vouloir supprimer tous les services? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Suppression annulée"
    exit 0
fi

# Supprimer tous les services
if kubectl get namespace intelectgame &> /dev/null; then
    echo "📦 Suppression des services..."
    kubectl delete -f k8s/all-services.yaml 2>/dev/null || true
    
    # Supprimer le namespace (supprime tout)
    echo "🗑️  Suppression du namespace..."
    kubectl delete namespace intelectgame
    
    echo "✅ Déploiement supprimé"
else
    echo "ℹ️  Le namespace 'intelectgame' n'existe pas"
fi

# Nettoyer les images Docker (optionnel)
read -p "Voulez-vous supprimer les images Docker locales? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    eval $(minikube docker-env 2>/dev/null || true)
    echo "🧹 Nettoyage des images..."
    docker rmi thismann17/gamev2-auth-service:latest 2>/dev/null || true
    docker rmi thismann17/gamev2-quiz-service:latest 2>/dev/null || true
    docker rmi thismann17/gamev2-game-service:latest 2>/dev/null || true
    docker rmi thismann17/gamev2-telegram-bot:latest 2>/dev/null || true
    docker rmi thismann17/gamev2-frontend:latest 2>/dev/null || true
    echo "✅ Images supprimées"
fi

echo ""
echo "✅ Nettoyage terminé"


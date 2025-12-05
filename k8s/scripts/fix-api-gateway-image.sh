#!/bin/bash

# Script pour résoudre le problème d'image API Gateway
# Ce script propose deux solutions : builder localement ou attendre DockerHub

set -e

echo "🔍 Diagnostic du problème d'image API Gateway..."
echo ""

# Vérifier si l'image existe sur DockerHub
echo "1. Vérification de l'image sur DockerHub..."
IMAGE_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" https://hub.docker.com/v2/repositories/thismann17/gamev2-api-gateway/tags/latest 2>/dev/null || echo "000")

if [ "$IMAGE_EXISTS" = "200" ]; then
    echo "   ✅ L'image existe sur DockerHub"
    echo ""
    echo "   Solution: Redémarrer le déploiement"
    echo "   kubectl rollout restart deployment/api-gateway -n intelectgame"
    echo ""
    read -p "Voulez-vous redémarrer le déploiement maintenant ? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl rollout restart deployment/api-gateway -n intelectgame
        kubectl rollout status deployment/api-gateway -n intelectgame --timeout=120s
        echo "✅ Déploiement redémarré"
    fi
else
    echo "   ❌ L'image n'existe pas encore sur DockerHub"
    echo ""
    echo "   Vous avez deux options :"
    echo ""
    echo "   Option 1: Builder l'image localement (RECOMMANDÉ - Immédiat)"
    echo "   ./k8s/scripts/build-api-gateway-local.sh"
    echo ""
    echo "   Option 2: Attendre que GitHub Actions build et push l'image"
    echo "   - Vérifiez le workflow GitHub Actions"
    echo "   - Une fois l'image pushée, redémarrez le déploiement"
    echo ""
    read -p "Voulez-vous builder l'image localement maintenant ? (Y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        ./k8s/scripts/build-api-gateway-local.sh
    else
        echo ""
        echo "⏳ Pour builder l'image plus tard, exécutez :"
        echo "   ./k8s/scripts/build-api-gateway-local.sh"
    fi
fi

echo ""
echo "📋 Vérification finale..."
kubectl get pods -n intelectgame -l app=api-gateway


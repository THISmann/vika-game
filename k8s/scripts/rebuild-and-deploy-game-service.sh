#!/bin/bash

# Script pour reconstruire et redéployer le game-service avec les logs de diagnostic
# Usage: ./k8s/scripts/rebuild-and-deploy-game-service.sh

set -e

NAMESPACE="intelectgame"

echo "🔨 Reconstruction et redéploiement du game-service..."
echo ""

echo "⚠️  NOTE: Ce script nécessite que vous ayez:"
echo "   1. Les images Docker construites et poussées sur Docker Hub"
echo "   2. Ou que vous construisiez les images localement"
echo ""
read -p "Continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 1. Redémarrer le deployment pour forcer le pull de la nouvelle image
echo ""
echo "🔄 1. Redémarrage du game-service..."
kubectl rollout restart deployment/game-service -n "$NAMESPACE"

# 2. Attendre que le pod soit prêt
echo ""
echo "⏳ 2. Attente que le game-service soit prêt (timeout: 120s)..."
if kubectl rollout status deployment/game-service -n "$NAMESPACE" --timeout=120s 2>/dev/null; then
    echo "   ✅ Game-service redémarré avec succès"
else
    echo "   ⚠️  Timeout - Vérification manuelle nécessaire"
fi

# 3. Vérifier l'état
echo ""
echo "📊 3. État du pod game-service:"
kubectl get pods -n "$NAMESPACE" -l app=game-service

# 4. Afficher les logs
echo ""
echo "📋 4. Derniers logs du game-service:"
GAME_POD=$(kubectl get pods -n "$NAMESPACE" -l app=game-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$GAME_POD" ]; then
    kubectl logs "$GAME_POD" -n "$NAMESPACE" --tail=20
fi

echo ""
echo "✅ Redéploiement terminé"
echo ""
echo "💡 Pour voir les logs en temps réel:"
echo "   kubectl logs -f -l app=game-service -n $NAMESPACE"
echo ""


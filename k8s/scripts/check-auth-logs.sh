#!/bin/bash

# Script pour vérifier les logs d'authentification complets
# Usage: ./k8s/scripts/check-auth-logs.sh

set -e

NAMESPACE="intelectgame"

echo "🔍 Vérification des logs d'authentification..."
echo ""

GAME_POD=$(kubectl get pods -n "$NAMESPACE" -l app=game-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$GAME_POD" ]; then
    echo "❌ Pod game-service non trouvé"
    exit 1
fi

echo "📋 Pod: $GAME_POD"
echo ""
echo "📝 Derniers logs d'authentification (sans filtre pour voir tous les détails):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl logs "$GAME_POD" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -A 15 "AUTHENTICATION REQUEST" | tail -50

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Recherche spécifique du header Authorization:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl logs "$GAME_POD" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -E "Authorization header|PRESENT|MISSING" | tail -10

echo ""
echo "💡 Pour voir les logs en temps réel:"
echo "   kubectl logs -f $GAME_POD -n $NAMESPACE"
echo ""


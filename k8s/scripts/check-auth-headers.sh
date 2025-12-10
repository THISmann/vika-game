#!/bin/bash

# Script pour vérifier la transmission des headers d'authentification
# Usage: ./k8s/scripts/check-auth-headers.sh

set -e

NAMESPACE="intelectgame"

echo "🔍 Vérification de la transmission des headers d'authentification..."
echo ""

# 1. Vérifier la configuration Nginx
echo "📝 1. Configuration Nginx dans le pod..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Pod: $NGINX_POD"
    echo ""
    echo "   Configuration pour /api/game:"
    kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | grep -A 15 "location /api/game" | grep -E "Authorization|proxy_pass_request_headers" || echo "   ⚠️  Configuration Authorization non trouvée"
else
    echo "   ❌ Pod Nginx non trouvé"
fi

# 2. Vérifier les logs du game-service
echo ""
echo "📋 2. Derniers logs du game-service (recherche d'authentification)..."
GAME_POD=$(kubectl get pods -n "$NAMESPACE" -l app=game-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$GAME_POD" ]; then
    echo "   Pod: $GAME_POD"
    echo ""
    echo "   Dernières requêtes d'authentification:"
    kubectl logs "$GAME_POD" -n "$NAMESPACE" --tail=50 2>/dev/null | grep -E "AUTHENTICATION|Authorization|401|auth" | tail -10 || echo "   Aucun log d'authentification trouvé"
else
    echo "   ❌ Pod game-service non trouvé"
fi

# 3. Vérifier la ConfigMap
echo ""
echo "📋 3. Configuration dans la ConfigMap..."
if kubectl get configmap nginx-proxy-config -n "$NAMESPACE" &> /dev/null; then
    echo "   ✅ ConfigMap existe"
    echo ""
    echo "   Vérification de la présence de 'Authorization' dans la config:"
    kubectl get configmap nginx-proxy-config -n "$NAMESPACE" -o jsonpath='{.data.nginx\.conf}' | grep -c "Authorization" | xargs -I {} echo "   Trouvé {} fois" || echo "   ⚠️  'Authorization' non trouvé"
else
    echo "   ❌ ConfigMap n'existe pas"
fi

echo ""
echo "✅ Vérification terminée"
echo ""
echo "💡 Pour voir les logs en temps réel:"
echo "   kubectl logs -f -l app=game-service -n $NAMESPACE | grep -i auth"
echo ""


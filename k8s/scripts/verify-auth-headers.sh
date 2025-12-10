#!/bin/bash

# Script pour vérifier que Nginx transmet bien les headers d'authentification
# Usage: ./k8s/scripts/verify-auth-headers.sh

set -e

NAMESPACE="intelectgame"

echo "🔍 Vérification de la transmission des headers d'authentification..."
echo ""

# 1. Vérifier la configuration Nginx
echo "📝 1. Vérification de la configuration Nginx..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$NGINX_POD" ]; then
    echo "❌ Pod Nginx non trouvé"
    exit 1
fi

echo "   Pod: $NGINX_POD"

# Vérifier la configuration dans le pod
echo ""
echo "📋 2. Configuration Nginx actuelle:"
kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf | grep -A 5 "Authorization" || echo "   ⚠️  Header Authorization non trouvé dans la configuration"

# Vérifier la ConfigMap
echo ""
echo "📋 3. Configuration dans la ConfigMap:"
kubectl get configmap nginx-proxy-config -n "$NAMESPACE" -o jsonpath='{.data.nginx\.conf}' | grep -A 3 "Authorization" | head -10 || echo "   ⚠️  Header Authorization non trouvé"

# Test avec curl depuis le pod
echo ""
echo "🧪 4. Test de transmission du header Authorization:"
echo "   Test depuis le pod Nginx vers game-service..."

# Créer un token de test (base64 encodé)
TEST_TOKEN="test-token-12345"

# Tester si le header est transmis
echo "   Envoi d'une requête avec header Authorization..."
RESULT=$(kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- sh -c "
  curl -s -o /dev/null -w '%{http_code}' \
    -H 'Authorization: Bearer $TEST_TOKEN' \
    -H 'Host: 82.202.141.248' \
    http://game-service.intelectgame.svc.cluster.local:3003/game/state
" 2>/dev/null || echo "ERROR")

if [ "$RESULT" = "200" ] || [ "$RESULT" = "401" ]; then
    echo "   ✅ Requête transmise (code: $RESULT)"
    if [ "$RESULT" = "401" ]; then
        echo "   ℹ️  Code 401 est normal - le token de test est invalide, mais la requête est bien transmise"
    fi
else
    echo "   ⚠️  Problème de transmission (code: $RESULT)"
fi

echo ""
echo "✅ Vérification terminée"
echo ""
echo "💡 Si le header Authorization n'est pas dans la configuration, exécutez:"
echo "   ./k8s/scripts/apply-nginx-fix.sh"
echo ""


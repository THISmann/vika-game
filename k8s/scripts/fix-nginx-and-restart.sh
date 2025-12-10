#!/bin/bash

# Script pour corriger Nginx et redémarrer avec vérification
# Usage: ./k8s/scripts/fix-nginx-and-restart.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Correction et redémarrage de Nginx..."
echo ""

# 1. Appliquer la configuration
echo "📝 1. Application de la configuration corrigée..."
kubectl apply -f k8s/nginx-proxy-config.yaml

# 2. Redémarrer Nginx
echo ""
echo "🔄 2. Redémarrage de Nginx..."
kubectl rollout restart deployment/nginx-proxy -n "$NAMESPACE"

# 3. Attendre que le pod soit prêt
echo ""
echo "⏳ 3. Attente que Nginx soit prêt (timeout: 90s)..."
if kubectl rollout status deployment/nginx-proxy -n "$NAMESPACE" --timeout=90s 2>/dev/null; then
    echo "   ✅ Nginx redémarré avec succès"
else
    echo "   ⚠️  Timeout - Vérification manuelle nécessaire"
fi

# 4. Vérifier l'état
echo ""
echo "📊 4. État du pod Nginx:"
kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy

# 5. Vérifier la configuration dans le pod
echo ""
echo "🔍 5. Vérification de la configuration dans le pod..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Pod: $NGINX_POD"
    echo ""
    echo "   Configuration Authorization pour /api/game:"
    kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf | grep -A 10 "location /api/game" | grep -E "Authorization|proxy_pass_request_headers" || echo "   ⚠️  Configuration Authorization non trouvée"
    
    echo ""
    echo "   Test de la syntaxe Nginx:"
    if kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- nginx -t 2>&1; then
        echo "   ✅ Configuration Nginx valide"
    else
        echo "   ❌ Configuration Nginx invalide"
    fi
fi

echo ""
echo "✅ Correction terminée"
echo ""
echo "💡 Testez maintenant une action admin depuis le frontend"
echo "   Si le problème persiste, vérifiez:"
echo "   1. Que le token est stocké: localStorage.getItem('adminToken')"
echo "   2. Les logs Nginx: kubectl logs -f -l app=nginx-proxy -n $NAMESPACE"
echo "   3. Les logs game-service: kubectl logs -f -l app=game-service -n $NAMESPACE | grep -i auth"
echo ""


#!/bin/bash

# Script pour appliquer la correction finale de Nginx pour l'authentification
# Usage: ./k8s/scripts/apply-nginx-auth-fix-final.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Application de la correction finale Nginx pour l'authentification..."
echo ""

# 1. Appliquer la configuration
echo "📝 1. Application de la configuration Nginx..."
kubectl apply -f k8s/nginx-proxy-config.yaml

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'application de la configuration"
    exit 1
fi

echo "   ✅ Configuration appliquée"
echo ""

# 2. Vérifier que la ConfigMap est créée
echo "🔍 2. Vérification de la ConfigMap..."
kubectl get configmap nginx-proxy-config -n "$NAMESPACE" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ ConfigMap non trouvée"
    exit 1
fi

echo "   ✅ ConfigMap trouvée"
echo ""

# 3. Redémarrer Nginx
echo "🔄 3. Redémarrage de Nginx..."
kubectl rollout restart deployment/nginx-proxy -n "$NAMESPACE"

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du redémarrage"
    exit 1
fi

echo "   ✅ Redémarrage initié"
echo ""

# 4. Attendre que le pod soit prêt
echo "⏳ 4. Attente que Nginx soit prêt..."
kubectl rollout status deployment/nginx-proxy -n "$NAMESPACE" --timeout=120s

if [ $? -ne 0 ]; then
    echo "⚠️  Timeout lors de l'attente du redémarrage"
    echo "   Vérifiez manuellement: kubectl get pods -n $NAMESPACE -l app=nginx-proxy"
else
    echo "   ✅ Nginx est prêt"
fi

echo ""

# 5. Vérifier la configuration dans le pod
echo "🔍 5. Vérification de la configuration dans le pod..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Pod: $NGINX_POD"
    echo ""
    echo "   Vérification de underscores_in_headers:"
    kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
      grep -E "underscores_in_headers" || echo "   ⚠️  underscores_in_headers non trouvé"
    
    echo ""
    echo "   Vérification de proxy_set_header Authorization:"
    kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
      grep -A 2 "location /api/game" | \
      grep -E "proxy_set_header Authorization|proxy_pass_request_headers" || \
      echo "   ⚠️  Configuration Authorization non trouvée"
    
    echo ""
    echo "   Test de la configuration Nginx:"
    kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- nginx -t 2>&1 | head -3
else
    echo "   ⚠️  Pod Nginx non trouvé"
fi

echo ""
echo "✅ Correction appliquée"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Rechargez la page du dashboard admin"
echo "   2. Essayez de démarrer le jeu"
echo "   3. Vérifiez les logs: kubectl logs -f -l app=game-service -n $NAMESPACE | grep -i AUTHENTICATION"
echo ""

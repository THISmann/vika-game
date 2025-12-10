#!/bin/bash

# Script final pour corriger la transmission du header Authorization
# Usage: ./k8s/scripts/apply-nginx-auth-fix-final.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Application de la correction finale pour l'authentification..."
echo ""

# 1. Appliquer la configuration
echo "📝 1. Application de la configuration corrigée..."
kubectl apply -f k8s/nginx-proxy-config.yaml

# 2. Vérifier que la ConfigMap est mise à jour
echo ""
echo "✅ 2. Vérification de la ConfigMap..."
if kubectl get configmap nginx-proxy-config -n "$NAMESPACE" &> /dev/null; then
    echo "   ✅ ConfigMap existe"
    
    # Vérifier que la configuration contient les bonnes directives
    if kubectl get configmap nginx-proxy-config -n "$NAMESPACE" -o jsonpath='{.data.nginx\.conf}' | grep -q "underscores_in_headers on"; then
        echo "   ✅ Configuration contient 'underscores_in_headers on'"
    else
        echo "   ⚠️  'underscores_in_headers on' non trouvé"
    fi
    
    if kubectl get configmap nginx-proxy-config -n "$NAMESPACE" -o jsonpath='{.data.nginx\.conf}' | grep -q "map.*auth_header"; then
        echo "   ✅ Configuration contient la map pour auth_header"
    else
        echo "   ⚠️  Map auth_header non trouvée"
    fi
else
    echo "   ❌ ConfigMap n'existe pas"
    exit 1
fi

# 3. Redémarrer Nginx
echo ""
echo "🔄 3. Redémarrage de Nginx..."
kubectl rollout restart deployment/nginx-proxy -n "$NAMESPACE"

# 4. Attendre que le pod soit prêt
echo ""
echo "⏳ 4. Attente que Nginx soit prêt (timeout: 90s)..."
if kubectl rollout status deployment/nginx-proxy -n "$NAMESPACE" --timeout=90s 2>/dev/null; then
    echo "   ✅ Nginx redémarré avec succès"
else
    echo "   ⚠️  Timeout - Vérification manuelle nécessaire"
fi

# 5. Vérifier la configuration dans le pod
echo ""
echo "🔍 5. Vérification de la configuration dans le pod..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Pod: $NGINX_POD"
    echo ""
    echo "   Test de la syntaxe Nginx:"
    if kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- nginx -t 2>&1; then
        echo "   ✅ Configuration Nginx valide"
    else
        echo "   ❌ Configuration Nginx invalide"
        echo "   Voir les erreurs ci-dessus"
    fi
    
    echo ""
    echo "   Vérification de la configuration pour /api/game:"
    kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
      sed -n '/location \/api\/game/,/location \/socket\.io/p' | \
      grep -E "Authorization|auth_header|proxy_pass_request_headers" || \
      echo "   ⚠️  Configuration Authorization non trouvée"
fi

echo ""
echo "✅ Correction appliquée"
echo ""
echo "💡 Testez maintenant une action admin depuis le frontend"
echo "   Les logs du game-service devraient maintenant montrer:"
echo "   🔐 Authorization header: PRESENT"
echo ""
echo "📋 Pour voir les logs:"
echo "   kubectl logs -f -l app=game-service -n $NAMESPACE | grep -i AUTHENTICATION"
echo ""


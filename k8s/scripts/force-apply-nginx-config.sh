#!/bin/bash

# Script pour forcer l'application de la configuration Nginx
# Usage: ./k8s/scripts/force-apply-nginx-config.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Application forcée de la configuration Nginx..."
echo ""

# 1. Vérifier que le fichier existe
if [ ! -f "k8s/nginx-proxy-config.yaml" ]; then
    echo "❌ Fichier k8s/nginx-proxy-config.yaml non trouvé"
    exit 1
fi

# 2. Appliquer la configuration
echo "📝 1. Application de la configuration..."
kubectl apply -f k8s/nginx-proxy-config.yaml

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'application de la configuration"
    exit 1
fi

echo "   ✅ Configuration appliquée"
echo ""

# 3. Vérifier que la ConfigMap est créée
echo "🔍 2. Vérification de la ConfigMap..."
kubectl get configmap nginx-proxy-config -n "$NAMESPACE" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ ConfigMap non trouvée"
    exit 1
fi

echo "   ✅ ConfigMap trouvée"
echo ""

# 4. Vérifier le contenu de la ConfigMap
echo "📋 3. Vérification du contenu de la ConfigMap..."
HAS_AUTH_HEADER=$(kubectl get configmap nginx-proxy-config -n "$NAMESPACE" -o yaml | grep -c "proxy_set_header Authorization" || echo "0")

if [ "$HAS_AUTH_HEADER" -eq "0" ]; then
    echo "   ⚠️  proxy_set_header Authorization non trouvé dans la ConfigMap"
    echo "   Vérifiez que le fichier k8s/nginx-proxy-config.yaml contient bien cette directive"
else
    echo "   ✅ proxy_set_header Authorization trouvé ($HAS_AUTH_HEADER fois)"
fi

HAS_UNDERSCORES=$(kubectl get configmap nginx-proxy-config -n "$NAMESPACE" -o yaml | grep -c "underscores_in_headers on" || echo "0")

if [ "$HAS_UNDERSCORES" -eq "0" ]; then
    echo "   ⚠️  underscores_in_headers on non trouvé dans la ConfigMap"
else
    echo "   ✅ underscores_in_headers on trouvé"
fi

echo ""

# 5. Supprimer le pod Nginx pour forcer le rechargement
echo "🔄 4. Suppression du pod Nginx pour forcer le rechargement..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Pod actuel: $NGINX_POD"
    kubectl delete pod "$NGINX_POD" -n "$NAMESPACE" --grace-period=0 --force 2>/dev/null || true
    echo "   ✅ Pod supprimé"
else
    echo "   ⚠️  Pod Nginx non trouvé"
fi

echo ""

# 6. Attendre que le nouveau pod soit prêt
echo "⏳ 5. Attente que le nouveau pod soit prêt..."
sleep 5

for i in {1..30}; do
    NEW_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    if [ -n "$NEW_POD" ]; then
        POD_STATUS=$(kubectl get pod "$NEW_POD" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "")
        if [ "$POD_STATUS" = "Running" ]; then
            echo "   ✅ Nouveau pod prêt: $NEW_POD"
            break
        fi
    fi
    if [ $i -eq 30 ]; then
        echo "   ⚠️  Timeout: le pod n'est pas prêt après 30 secondes"
        echo "   Vérifiez manuellement: kubectl get pods -n $NAMESPACE -l app=nginx-proxy"
    else
        echo "   ⏳ Attente... ($i/30)"
        sleep 1
    fi
done

echo ""

# 7. Vérifier la configuration dans le nouveau pod
echo "🔍 6. Vérification de la configuration dans le nouveau pod..."
if [ -n "$NEW_POD" ]; then
    echo "   Pod: $NEW_POD"
    echo ""
    
    echo "   ✅ underscores_in_headers:"
    kubectl exec -n "$NAMESPACE" "$NEW_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
      grep -q "underscores_in_headers on" && echo "      Activé" || echo "      ❌ Non activé"
    
    echo ""
    echo "   ✅ proxy_set_header Authorization dans /api/game:"
    kubectl exec -n "$NAMESPACE" "$NEW_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
      grep -A 10 "location /api/game" | \
      grep -q "proxy_set_header Authorization" && echo "      Présent" || echo "      ❌ Absent"
    
    echo ""
    echo "   ✅ proxy_pass_request_headers dans /api/game:"
    kubectl exec -n "$NAMESPACE" "$NEW_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
      grep -A 10 "location /api/game" | \
      grep -q "proxy_pass_request_headers on" && echo "      Activé" || echo "      ❌ Non activé"
    
    echo ""
    echo "   Test de la configuration Nginx:"
    kubectl exec -n "$NAMESPACE" "$NEW_POD" -- nginx -t 2>&1 | head -3
else
    echo "   ⚠️  Nouveau pod non trouvé"
fi

echo ""
echo "✅ Application terminée"
echo ""
echo "💡 Prochaines étapes:"
echo "   1. Testez depuis le navigateur (démarrer le jeu)"
echo "   2. Vérifiez les logs: kubectl logs -f -l app=game-service -n $NAMESPACE | grep -i AUTHENTICATION"
echo "   3. Vous devriez voir: 🔐 Authorization header: PRESENT"
echo ""


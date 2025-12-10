#!/bin/bash

# Script pour corriger et redéployer la configuration Nginx avec support d'authentification
# Usage: ./k8s/scripts/fix-nginx-auth.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Correction de la configuration Nginx pour l'authentification..."
echo ""

# 1. Appliquer la nouvelle configuration
echo "📝 Application de la configuration Nginx..."
kubectl apply -f k8s/nginx-proxy-config.yaml

# 2. Redémarrer le pod Nginx pour appliquer les changements
echo ""
echo "🔄 Redémarrage du pod Nginx..."
kubectl rollout restart deployment/nginx-proxy -n "$NAMESPACE"

# 3. Attendre que le pod soit prêt
echo ""
echo "⏳ Attente que le pod Nginx soit prêt..."
kubectl rollout status deployment/nginx-proxy -n "$NAMESPACE" --timeout=120s

# 4. Vérifier que le pod fonctionne
echo ""
echo "✅ Vérification du pod Nginx..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Pod: $NGINX_POD"
    
    # Vérifier le statut
    STATUS=$(kubectl get pod "$NGINX_POD" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
    echo "   Status: $STATUS"
    
    if [ "$STATUS" = "Running" ]; then
        echo "   ✅ Pod Nginx est en cours d'exécution"
        
        # Vérifier la configuration Nginx
        echo ""
        echo "🔍 Vérification de la configuration Nginx..."
        if kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- nginx -t &> /dev/null; then
            echo "   ✅ Configuration Nginx valide"
        else
            echo "   ⚠️  Configuration Nginx invalide, voir les logs:"
            kubectl logs "$NGINX_POD" -n "$NAMESPACE" --tail=20
        fi
    else
        echo "   ⚠️  Pod Nginx n'est pas en cours d'exécution"
        echo "   Voir les logs:"
        kubectl logs "$NGINX_POD" -n "$NAMESPACE" --tail=20
    fi
else
    echo "   ❌ Pod Nginx non trouvé"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Configuration appliquée"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "La configuration Nginx a été mise à jour pour transmettre le header Authorization."
echo ""
echo "🔍 Pour vérifier que tout fonctionne:"
echo "   1. Vérifiez les logs du pod Nginx:"
echo "      kubectl logs -f $NGINX_POD -n $NAMESPACE"
echo ""
echo "   2. Testez une requête avec authentification depuis le frontend"
echo ""
echo "   3. Vérifiez les logs des services backend pour voir si le header Authorization est reçu:"
echo "      kubectl logs -f -l app=game-service -n $NAMESPACE | grep -i authorization"
echo ""
echo "💡 Note: Si le problème persiste, vérifiez que:"
echo "   - Le token est bien stocké dans localStorage (adminToken)"
echo "   - Le frontend envoie bien le header Authorization"
echo "   - Les services backend reçoivent le header (vérifier les logs)"
echo ""


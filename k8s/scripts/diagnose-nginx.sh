#!/bin/bash

# Script pour diagnostiquer les problèmes de déploiement Nginx
# Usage: ./k8s/scripts/diagnose-nginx.sh

set -e

NAMESPACE="intelectgame"

echo "🔍 Diagnostic du déploiement Nginx..."
echo "=================================================="
echo ""

# 1. Vérifier les pods Nginx
echo "📦 1. État des pods Nginx:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy

echo ""
echo "📋 2. Détails du pod Nginx:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$NGINX_POD" ]; then
    echo "❌ Aucun pod Nginx trouvé"
    echo ""
    echo "Vérification du deployment..."
    kubectl get deployment nginx-proxy -n "$NAMESPACE"
    exit 1
fi

echo "Pod: $NGINX_POD"
kubectl describe pod "$NGINX_POD" -n "$NAMESPACE"

echo ""
echo "📝 3. Logs du pod Nginx:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl logs "$NGINX_POD" -n "$NAMESPACE" --tail=50 || echo "Impossible de récupérer les logs"

echo ""
echo "📢 4. Événements récents:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get events -n "$NAMESPACE" --field-selector involvedObject.name="$NGINX_POD" --sort-by='.lastTimestamp' | tail -10

echo ""
echo "⚙️  5. Vérification de la configuration Nginx:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier si le pod peut tester la configuration
if kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- nginx -t 2>&1; then
    echo "✅ Configuration Nginx valide"
else
    echo "❌ Configuration Nginx invalide"
    echo ""
    echo "Vérification de la ConfigMap..."
    kubectl get configmap nginx-proxy-config -n "$NAMESPACE" -o yaml | grep -A 5 "nginx.conf" | head -20
fi

echo ""
echo "🔧 6. Actions recommandées:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

STATUS=$(kubectl get pod "$NGINX_POD" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
REASON=$(kubectl get pod "$NGINX_POD" -n "$NAMESPACE" -o jsonpath='{.status.containerStatuses[0].state.waiting.reason}' 2>/dev/null || echo "")

if [ "$STATUS" = "Pending" ]; then
    echo "⚠️  Pod en état Pending"
    echo "   Causes possibles:"
    echo "   - Ressources insuffisantes (CPU/Memory)"
    echo "   - Image Docker non disponible"
    echo "   - Volume non monté"
    echo ""
    echo "   Solutions:"
    echo "   1. Vérifier les ressources disponibles:"
    echo "      kubectl top nodes"
    echo "   2. Vérifier que l'image nginx:alpine est disponible"
    echo "   3. Supprimer et recréer le pod:"
    echo "      kubectl delete pod $NGINX_POD -n $NAMESPACE"
elif [ "$STATUS" = "CrashLoopBackOff" ] || [ "$REASON" = "CrashLoopBackOff" ]; then
    echo "⚠️  Pod en CrashLoopBackOff"
    echo "   Cause probable: Erreur dans la configuration Nginx"
    echo ""
    echo "   Solutions:"
    echo "   1. Vérifier les logs pour voir l'erreur exacte"
    echo "   2. Vérifier la syntaxe de la configuration Nginx"
    echo "   3. Corriger la configuration et redéployer:"
    echo "      kubectl apply -f k8s/nginx-proxy-config.yaml"
    echo "      kubectl rollout restart deployment/nginx-proxy -n $NAMESPACE"
elif [ "$STATUS" = "Error" ]; then
    echo "⚠️  Pod en erreur"
    echo "   Vérifier les logs et les événements ci-dessus"
else
    echo "✅ Pod en état: $STATUS"
    if [ "$STATUS" = "Running" ]; then
        echo "   Le pod fonctionne correctement"
    fi
fi

echo ""


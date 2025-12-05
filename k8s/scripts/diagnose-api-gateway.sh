#!/bin/bash

# Script pour diagnostiquer les problèmes de l'API Gateway
# Usage: ./k8s/scripts/diagnose-api-gateway.sh

set -e

NAMESPACE="intelectgame"

echo "🔍 Diagnostic de l'API Gateway..."
echo ""

# 1. Vérifier les pods
echo "=== 1. État des pods ==="
kubectl get pods -n $NAMESPACE -l app=api-gateway -o wide
echo ""

# 2. Vérifier les événements récents
echo "=== 2. Événements récents ==="
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep api-gateway | tail -10
echo ""

# 3. Vérifier les logs des pods
echo "=== 3. Logs des pods (dernières 20 lignes) ==="
PODS=$(kubectl get pods -n $NAMESPACE -l app=api-gateway -o jsonpath='{.items[*].metadata.name}' 2>/dev/null)
if [ -z "$PODS" ]; then
    echo "❌ Aucun pod trouvé"
else
    for POD in $PODS; do
        echo ""
        echo "📋 Logs de $POD :"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        kubectl logs -n $NAMESPACE $POD --tail=20 2>&1 || echo "❌ Impossible de récupérer les logs"
        echo ""
    done
fi

# 4. Vérifier la description d'un pod
echo "=== 4. Description détaillée d'un pod ==="
FIRST_POD=$(kubectl get pods -n $NAMESPACE -l app=api-gateway -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$FIRST_POD" ]; then
    kubectl describe pod -n $NAMESPACE $FIRST_POD | tail -30
else
    echo "❌ Aucun pod trouvé pour la description"
fi
echo ""

# 5. Vérifier le service
echo "=== 5. Service API Gateway ==="
kubectl get service api-gateway -n $NAMESPACE
echo ""

# 6. Vérifier les endpoints
echo "=== 6. Endpoints du service ==="
kubectl get endpoints api-gateway -n $NAMESPACE
echo ""

# 7. Test de connectivité depuis un pod
echo "=== 7. Test de connectivité ==="
if [ -n "$FIRST_POD" ]; then
    echo "Test depuis le pod $FIRST_POD :"
    kubectl exec -n $NAMESPACE $FIRST_POD -- wget -qO- --timeout=3 http://localhost:3000/health 2>&1 || echo "❌ Le service ne répond pas"
else
    echo "❌ Aucun pod disponible pour le test"
fi
echo ""

# 8. Vérifier les variables d'environnement
echo "=== 8. Variables d'environnement ==="
if [ -n "$FIRST_POD" ]; then
    kubectl exec -n $NAMESPACE $FIRST_POD -- env | grep -E "PORT|SERVICE|NODE" || echo "❌ Impossible de récupérer les variables"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Si les pods sont en CrashLoopBackOff :"
echo "  - Vérifiez les logs ci-dessus pour identifier l'erreur"
echo "  - Vérifiez que les services backend sont accessibles"
echo ""
echo "Si les pods sont en ImagePullBackOff :"
echo "  - L'image n'est pas disponible, utilisez build-api-gateway-local.sh"
echo ""
echo "Si les health checks échouent :"
echo "  - Vérifiez que le service écoute sur le port 3000"
echo "  - Vérifiez que /health répond correctement"
echo ""


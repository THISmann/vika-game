#!/bin/bash

# Script pour déployer l'API Gateway dans Kubernetes
# Usage: ./k8s/scripts/deploy-api-gateway.sh

set -e

NAMESPACE="intelectgame"

echo "🚀 Déploiement de l'API Gateway..."
echo ""

# 1. Vérifier que le namespace existe
if ! kubectl get namespace $NAMESPACE &>/dev/null; then
    echo "❌ Namespace $NAMESPACE n'existe pas !"
    echo "   Création du namespace..."
    kubectl create namespace $NAMESPACE
fi

# 2. Déployer l'API Gateway
echo "1. Déploiement de l'API Gateway..."
kubectl apply -f k8s/api-gateway-deployment.yaml

# 3. Attendre que le déploiement soit prêt
echo ""
echo "2. Attente que les pods soient prêts..."
kubectl rollout status deployment/api-gateway -n $NAMESPACE --timeout=120s

# 4. Vérifier le statut
echo ""
echo "3. Statut du déploiement..."
kubectl get pods -n $NAMESPACE -l app=api-gateway
kubectl get service api-gateway -n $NAMESPACE

# 5. Tester la santé
echo ""
echo "4. Test de santé de l'API Gateway..."
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=api-gateway -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
    HEALTH=$(kubectl exec -n $NAMESPACE $POD_NAME -- wget -qO- --timeout=3 http://localhost:3000/health 2>/dev/null || echo "FAILED")
    if echo "$HEALTH" | grep -q "ok"; then
        echo "   ✅ API Gateway est en bonne santé"
    else
        echo "   ⚠️  API Gateway ne répond pas correctement"
        echo "   Vérifiez les logs: kubectl logs -n $NAMESPACE $POD_NAME"
    fi
fi

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📋 Commandes utiles :"
echo "   - Voir les logs: kubectl logs -n $NAMESPACE -l app=api-gateway -f"
echo "   - Voir le statut: kubectl get pods -n $NAMESPACE -l app=api-gateway"
echo "   - Tester: kubectl port-forward -n $NAMESPACE service/api-gateway 3000:3000"
echo "   - Puis: curl http://localhost:3000/health"
echo ""


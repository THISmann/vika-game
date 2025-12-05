#!/bin/bash

# Script pour corriger les problèmes de déploiement de l'API Gateway
# Usage: ./k8s/scripts/fix-api-gateway-deployment.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Correction du déploiement API Gateway..."
echo ""

# 1. Supprimer les pods en erreur pour forcer un redémarrage
echo "1. Suppression des pods en erreur..."
kubectl delete pods -n $NAMESPACE -l app=api-gateway --force --grace-period=0 2>/dev/null || echo "   Aucun pod à supprimer"
sleep 2

# 2. Vérifier que l'image existe localement
echo ""
echo "2. Vérification de l'image locale..."
if docker images | grep -q "thismann17/gamev2-api-gateway"; then
    echo "   ✅ Image locale trouvée"
else
    echo "   ⚠️  Image locale non trouvée, construction..."
    eval $(minikube docker-env)
    docker build -t thismann17/gamev2-api-gateway:latest ./node/api-gateway
fi

# 3. Vérifier le deployment
echo ""
echo "3. Vérification du deployment..."
kubectl get deployment api-gateway -n $NAMESPACE || {
    echo "   ❌ Deployment n'existe pas, création..."
    kubectl apply -f k8s/api-gateway-deployment.yaml
}

# 4. Augmenter temporairement les timeouts des health checks
echo ""
echo "4. Ajustement des health checks (timeouts plus longs)..."
kubectl patch deployment api-gateway -n $NAMESPACE -p '{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "api-gateway",
          "livenessProbe": {
            "initialDelaySeconds": 30,
            "periodSeconds": 10,
            "timeoutSeconds": 5
          },
          "readinessProbe": {
            "initialDelaySeconds": 15,
            "periodSeconds": 5,
            "timeoutSeconds": 3
          }
        }]
      }
    }
  }
}' || echo "   ⚠️  Impossible de patcher, continuons..."

# 5. Attendre que les pods démarrent
echo ""
echo "5. Attente que les pods démarrent (60 secondes)..."
sleep 5
kubectl wait --for=condition=ready pod -l app=api-gateway -n $NAMESPACE --timeout=60s || {
    echo "   ⚠️  Timeout, vérification de l'état..."
    kubectl get pods -n $NAMESPACE -l app=api-gateway
}

# 6. Vérifier les logs
echo ""
echo "6. Vérification des logs..."
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=api-gateway -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
    echo "   Logs de $POD_NAME :"
    kubectl logs -n $NAMESPACE $POD_NAME --tail=30
else
    echo "   ❌ Aucun pod trouvé"
fi

# 7. Test de santé
echo ""
echo "7. Test de santé..."
if [ -n "$POD_NAME" ]; then
    HEALTH=$(kubectl exec -n $NAMESPACE $POD_NAME -- wget -qO- --timeout=5 http://localhost:3000/health 2>/dev/null || echo "FAILED")
    if echo "$HEALTH" | grep -q "ok"; then
        echo "   ✅ API Gateway est en bonne santé"
    else
        echo "   ⚠️  API Gateway ne répond pas correctement"
        echo "   Réponse: $HEALTH"
    fi
fi

echo ""
echo "✅ Correction terminée !"
echo ""
echo "📋 Commandes utiles :"
echo "   - Voir les logs: kubectl logs -n $NAMESPACE -l app=api-gateway -f"
echo "   - Voir l'état: kubectl get pods -n $NAMESPACE -l app=api-gateway"
echo "   - Diagnostiquer: ./k8s/scripts/diagnose-api-gateway.sh"
echo ""


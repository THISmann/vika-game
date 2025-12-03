#!/bin/bash

# Script pour corriger MongoDB en gardant les données (utilise l'URI avec credentials)
# Usage: ./fix-mongodb-keep-data.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Correction de MongoDB (en gardant les données)..."
echo ""

# 1. Vérifier que le secret MongoDB existe
echo "=== 1. Vérification du secret MongoDB ==="
if ! kubectl get secret mongodb-secret -n "$NAMESPACE" &>/dev/null; then
  echo "   Création du secret MongoDB..."
  kubectl create secret generic mongodb-secret \
    --from-literal=username=admin \
    --from-literal=password=admin123 \
    -n "$NAMESPACE"
  echo "✅ Secret créé"
else
  echo "✅ Secret existe déjà"
fi
echo ""

# 2. Mettre à jour le ConfigMap avec l'URI avec credentials
echo "=== 2. Mise à jour du ConfigMap ==="
kubectl patch configmap app-config -n "$NAMESPACE" --type merge -p '{
  "data": {
    "MONGODB_URI": "mongodb://admin:admin123@mongodb:27017/intelectgame?authSource=admin"
  }
}' || {
  echo "   Création du ConfigMap..."
  kubectl create configmap app-config -n "$NAMESPACE" --from-literal=MONGODB_URI="mongodb://admin:admin123@mongodb:27017/intelectgame?authSource=admin" || true
}

echo "✅ ConfigMap mis à jour avec URI avec authentification"
echo ""

# 3. Redémarrer tous les services
echo "=== 3. Redémarrage des micro-services ==="
SERVICES=("auth-service" "quiz-service" "game-service")

for service in "${SERVICES[@]}"; do
  if kubectl get deployment -n "$NAMESPACE" "$service" &>/dev/null; then
    echo "   Redémarrage de $service..."
    kubectl rollout restart deployment/"$service" -n "$NAMESPACE"
  fi
done

echo ""
echo "⏳ Attente que les services redémarrent..."
sleep 15

for service in "${SERVICES[@]}"; do
  if kubectl get deployment -n "$NAMESPACE" "$service" &>/dev/null; then
    echo "   Vérification de $service..."
    kubectl rollout status deployment/"$service" -n "$NAMESPACE" --timeout=120s || echo "   ⚠️  $service prend plus de temps"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Correction terminée!"
echo ""
echo "📝 Vérifiez que les services se connectent:"
echo "   kubectl logs -n $NAMESPACE deployment/auth-service | grep MongoDB"
echo "   kubectl logs -n $NAMESPACE deployment/quiz-service | grep MongoDB"
echo "   kubectl logs -n $NAMESPACE deployment/game-service | grep MongoDB"
echo ""
echo "🧪 Testez les endpoints:"
echo "   ./test-all-endpoints.sh http://82.202.141.248"
echo "═══════════════════════════════════════════════════════════"


#!/bin/bash

# Script pour corriger les problèmes d'authentification MongoDB
# Usage: ./fix-mongodb-auth.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Correction des problèmes MongoDB..."
echo ""

# 1. Mettre à jour le déploiement MongoDB pour désactiver l'authentification
echo "=== 1. Mise à jour du déploiement MongoDB ==="
kubectl apply -f k8s/mongodb-deployment.yaml
echo "✅ Déploiement MongoDB mis à jour"
echo ""

# 2. Redémarrer MongoDB pour appliquer les changements
echo "=== 2. Redémarrage de MongoDB ==="
kubectl rollout restart deployment/mongodb -n "$NAMESPACE"
echo "⏳ Attente que MongoDB redémarre..."
kubectl rollout status deployment/mongodb -n "$NAMESPACE" --timeout=120s
echo "✅ MongoDB redémarré"
echo ""

# 3. Vérifier que MongoDB est accessible sans authentification
echo "=== 3. Test de connexion MongoDB ==="
sleep 5
POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app=mongodb -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
  echo "   Test depuis pod: $POD_NAME"
  if kubectl exec -n "$NAMESPACE" "$POD_NAME" -- mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "✅ MongoDB répond correctement"
  else
    echo "⚠️  MongoDB ne répond pas encore (peut prendre quelques secondes)"
  fi
fi
echo ""

# 4. Redémarrer tous les services pour qu'ils se reconnectent
echo "=== 4. Redémarrage des micro-services ==="
SERVICES=("auth-service" "quiz-service" "game-service")

for service in "${SERVICES[@]}"; do
  if kubectl get deployment -n "$NAMESPACE" "$service" &>/dev/null; then
    echo "   Redémarrage de $service..."
    kubectl rollout restart deployment/"$service" -n "$NAMESPACE"
  fi
done

echo ""
echo "⏳ Attente que les services redémarrent..."
sleep 10

for service in "${SERVICES[@]}"; do
  if kubectl get deployment -n "$NAMESPACE" "$service" &>/dev/null; then
    echo "   Vérification de $service..."
    kubectl rollout status deployment/"$service" -n "$NAMESPACE" --timeout=120s || echo "   ⚠️  $service prend plus de temps"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Corrections appliquées!"
echo ""
echo "📝 Vérifiez que les services se connectent à MongoDB:"
echo "   kubectl logs -n $NAMESPACE deployment/auth-service | grep MongoDB"
echo "   kubectl logs -n $NAMESPACE deployment/quiz-service | grep MongoDB"
echo "   kubectl logs -n $NAMESPACE deployment/game-service | grep MongoDB"
echo ""
echo "🧪 Testez les endpoints:"
echo "   ./test-all-endpoints.sh http://82.202.141.248"
echo "═══════════════════════════════════════════════════════════"


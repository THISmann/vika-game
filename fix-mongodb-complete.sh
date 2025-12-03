#!/bin/bash

# Script complet pour corriger MongoDB (supprime les données et redéploie)
# Usage: ./fix-mongodb-complete.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Correction complète de MongoDB..."
echo ""
echo "⚠️  ATTENTION: Ce script va supprimer toutes les données MongoDB!"
echo "   Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer..."
read

# 1. Supprimer le déploiement MongoDB actuel
echo "=== 1. Suppression de MongoDB existant ==="
kubectl delete deployment mongodb -n "$NAMESPACE" 2>/dev/null || echo "   Déploiement déjà supprimé"
kubectl delete svc mongodb -n "$NAMESPACE" 2>/dev/null || echo "   Service déjà supprimé"

# 2. Supprimer le PVC pour repartir à zéro
echo ""
echo "=== 2. Suppression du PVC (données MongoDB) ==="
kubectl delete pvc mongodb-pvc -n "$NAMESPACE" 2>/dev/null || echo "   PVC déjà supprimé"

# 3. Attendre un peu
echo ""
echo "⏳ Attente de 5 secondes..."
sleep 5

# 4. Redéployer MongoDB sans authentification
echo ""
echo "=== 3. Déploiement de MongoDB sans authentification ==="
kubectl apply -f k8s/mongodb-deployment.yaml

echo ""
echo "⏳ Attente que MongoDB soit prêt..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n "$NAMESPACE" || {
  echo "⚠️  MongoDB prend plus de temps que prévu"
  echo "   Vérifiez: kubectl get pods -n $NAMESPACE -l app=mongodb"
}

# 5. Vérifier que MongoDB fonctionne
echo ""
echo "=== 4. Vérification de MongoDB ==="
sleep 5
POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app=mongodb -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
  if kubectl exec -n "$NAMESPACE" "$POD_NAME" -- mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "✅ MongoDB fonctionne correctement"
  else
    echo "⚠️  MongoDB ne répond pas encore (peut prendre quelques secondes)"
  fi
fi

# 6. Redémarrer tous les services
echo ""
echo "=== 5. Redémarrage des micro-services ==="
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


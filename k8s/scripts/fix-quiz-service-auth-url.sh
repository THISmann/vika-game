#!/bin/bash

# Script pour corriger AUTH_SERVICE_URL dans quiz-service

NAMESPACE="intelectgame"
CONFIGMAP_NAME="app-config"
QUIZ_DEPLOYMENT="quiz-service"

echo "🔧 Correction de AUTH_SERVICE_URL pour quiz-service..."
echo ""

# 1. Vérifier le ConfigMap
echo "--- 1. Vérification du ConfigMap ---"
kubectl get configmap $CONFIGMAP_NAME -n $NAMESPACE -o yaml | grep AUTH_SERVICE_URL
echo ""

# 2. Vérifier les variables d'environnement dans les pods quiz-service
echo "--- 2. Variables d'environnement actuelles dans les pods ---"
QUIZ_PODS=$(kubectl get pods -n $NAMESPACE -l app=$QUIZ_DEPLOYMENT -o jsonpath='{.items[*].metadata.name}')
for POD in $QUIZ_PODS; do
  echo "Pod: $POD"
  kubectl exec -n $NAMESPACE $POD -- env | grep AUTH_SERVICE_URL || echo "  ❌ AUTH_SERVICE_URL not found"
  echo ""
done

# 3. Appliquer le ConfigMap si nécessaire
echo "--- 3. Application du ConfigMap ---"
kubectl apply -f k8s/configmap.yaml -n $NAMESPACE
echo ""

# 4. Vérifier que le deployment référence bien le ConfigMap
echo "--- 4. Vérification du deployment ---"
kubectl get deployment $QUIZ_DEPLOYMENT -n $NAMESPACE -o yaml | grep -A 5 "AUTH_SERVICE_URL"
echo ""

# 5. Redémarrer les pods pour qu'ils prennent la nouvelle configuration
echo "--- 5. Redémarrage des pods quiz-service ---"
kubectl rollout restart deployment/$QUIZ_DEPLOYMENT -n $NAMESPACE
echo ""

# 6. Attendre que les pods soient prêts
echo "--- 6. Attente que les pods soient prêts (max 120s) ---"
kubectl rollout status deployment/$QUIZ_DEPLOYMENT -n $NAMESPACE --timeout=120s
echo ""

# 7. Vérifier les nouvelles variables d'environnement
echo "--- 7. Vérification des nouvelles variables d'environnement ---"
sleep 5
NEW_QUIZ_PODS=$(kubectl get pods -n $NAMESPACE -l app=$QUIZ_DEPLOYMENT -o jsonpath='{.items[*].metadata.name}')
for POD in $NEW_QUIZ_PODS; do
  echo "Pod: $POD"
  AUTH_URL=$(kubectl exec -n $NAMESPACE $POD -- env | grep AUTH_SERVICE_URL | cut -d'=' -f2)
  if [ "$AUTH_URL" = "http://auth-service:3001" ]; then
    echo "  ✅ AUTH_SERVICE_URL: $AUTH_URL (correct)"
  else
    echo "  ❌ AUTH_SERVICE_URL: $AUTH_URL (incorrect, devrait être http://auth-service:3001)"
  fi
  echo ""
done

echo "✅ Correction terminée."
echo ""
echo "💡 Si AUTH_SERVICE_URL est toujours incorrect:"
echo "   1. Vérifiez que le ConfigMap existe: kubectl get configmap $CONFIGMAP_NAME -n $NAMESPACE"
echo "   2. Vérifiez que le deployment référence le ConfigMap: kubectl get deployment $QUIZ_DEPLOYMENT -n $NAMESPACE -o yaml"
echo "   3. Supprimez manuellement les pods pour forcer le redémarrage: kubectl delete pods -n $NAMESPACE -l app=$QUIZ_DEPLOYMENT"


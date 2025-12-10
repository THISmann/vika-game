#!/bin/bash

# Script pour supprimer les anciens pods quiz-service qui n'ont pas AUTH_SERVICE_URL

NAMESPACE="intelectgame"
QUIZ_SERVICE_LABEL="quiz-service"

echo "🧹 Nettoyage des anciens pods quiz-service sans AUTH_SERVICE_URL..."
echo ""

# 1. Lister tous les pods quiz-service
echo "--- 1. Liste de tous les pods quiz-service ---"
ALL_PODS=$(kubectl get pods -n $NAMESPACE -l app=$QUIZ_SERVICE_LABEL -o jsonpath='{.items[*].metadata.name}')
echo "Pods trouvés: $ALL_PODS"
echo ""

# 2. Identifier les pods sans AUTH_SERVICE_URL
echo "--- 2. Identification des pods sans AUTH_SERVICE_URL ---"
PODS_TO_DELETE=()

for POD in $ALL_PODS; do
  AUTH_URL=$(kubectl exec -n $NAMESPACE $POD -- env 2>/dev/null | grep AUTH_SERVICE_URL | cut -d'=' -f2)
  if [ -z "$AUTH_URL" ]; then
    echo "❌ Pod $POD n'a pas AUTH_SERVICE_URL - sera supprimé"
    PODS_TO_DELETE+=("$POD")
  else
    echo "✅ Pod $POD a AUTH_SERVICE_URL: $AUTH_URL"
  fi
done

echo ""

# 3. Supprimer les pods sans AUTH_SERVICE_URL
if [ ${#PODS_TO_DELETE[@]} -eq 0 ]; then
  echo "✅ Tous les pods ont AUTH_SERVICE_URL. Aucune action nécessaire."
else
  echo "--- 3. Suppression des pods sans AUTH_SERVICE_URL ---"
  for POD in "${PODS_TO_DELETE[@]}"; do
    echo "🗑️ Suppression du pod: $POD"
    kubectl delete pod $POD -n $NAMESPACE --grace-period=0 --force
  done
  echo ""
  
  # 4. Attendre que les nouveaux pods soient créés
  echo "--- 4. Attente que les nouveaux pods soient créés ---"
  echo "Attente de 10 secondes..."
  sleep 10
  
  # 5. Vérifier les nouveaux pods
  echo ""
  echo "--- 5. Vérification des nouveaux pods ---"
  NEW_PODS=$(kubectl get pods -n $NAMESPACE -l app=$QUIZ_SERVICE_LABEL -o jsonpath='{.items[*].metadata.name}')
  for POD in $NEW_PODS; do
    echo "Pod: $POD"
    AUTH_URL=$(kubectl exec -n $NAMESPACE $POD -- env 2>/dev/null | grep AUTH_SERVICE_URL | cut -d'=' -f2)
    if [ "$AUTH_URL" = "http://auth-service:3001" ]; then
      echo "  ✅ AUTH_SERVICE_URL: $AUTH_URL (correct)"
    elif [ -n "$AUTH_URL" ]; then
      echo "  ⚠️ AUTH_SERVICE_URL: $AUTH_URL (devrait être http://auth-service:3001)"
    else
      echo "  ❌ AUTH_SERVICE_URL: non trouvé"
    fi
    echo ""
  done
fi

echo "✅ Nettoyage terminé."
echo ""
echo "💡 Si certains pods n'ont toujours pas AUTH_SERVICE_URL:"
echo "   1. Vérifiez le deployment: kubectl get deployment quiz-service -n $NAMESPACE -o yaml | grep -A 5 AUTH_SERVICE_URL"
echo "   2. Vérifiez le ConfigMap: kubectl get configmap app-config -n $NAMESPACE -o yaml | grep AUTH_SERVICE_URL"
echo "   3. Redémarrez le deployment: kubectl rollout restart deployment/quiz-service -n $NAMESPACE"


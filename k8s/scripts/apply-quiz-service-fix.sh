#!/bin/bash

# Script pour appliquer la correction du deployment quiz-service avec AUTH_SERVICE_URL

NAMESPACE="intelectgame"
DEPLOYMENT_FILE="k8s/quiz-service-deployment.yaml"

echo "🔧 Application de la correction du deployment quiz-service..."
echo ""

# 1. Vérifier que le fichier existe
if [ ! -f "$DEPLOYMENT_FILE" ]; then
  echo "❌ Fichier $DEPLOYMENT_FILE non trouvé"
  exit 1
fi

# 2. Appliquer le deployment
echo "--- 1. Application du deployment ---"
kubectl apply -f $DEPLOYMENT_FILE -n $NAMESPACE
echo ""

# 3. Vérifier que le deployment a été mis à jour
echo "--- 2. Vérification du deployment ---"
kubectl get deployment quiz-service -n $NAMESPACE -o yaml | grep -A 5 "AUTH_SERVICE_URL" || echo "⚠️ AUTH_SERVICE_URL non trouvé dans le deployment"
echo ""

# 4. Forcer le redémarrage
echo "--- 3. Redémarrage forcé des pods ---"
kubectl rollout restart deployment/quiz-service -n $NAMESPACE
echo ""

# 5. Attendre que les pods soient prêts
echo "--- 4. Attente que les pods soient prêts (max 120s) ---"
kubectl rollout status deployment/quiz-service -n $NAMESPACE --timeout=120s
echo ""

# 6. Vérifier les variables d'environnement dans les nouveaux pods
echo "--- 5. Vérification des variables d'environnement ---"
sleep 5
QUIZ_PODS=$(kubectl get pods -n $NAMESPACE -l app=quiz-service -o jsonpath='{.items[*].metadata.name}')
for POD in $QUIZ_PODS; do
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

echo "✅ Correction appliquée."
echo ""
echo "💡 Si AUTH_SERVICE_URL est toujours incorrect, vérifiez:"
echo "   1. Le ConfigMap: kubectl get configmap app-config -n $NAMESPACE -o yaml"
echo "   2. Le deployment: kubectl get deployment quiz-service -n $NAMESPACE -o yaml | grep -A 5 AUTH_SERVICE_URL"


#!/bin/bash

# Script pour vérifier et diagnostiquer le déploiement Helm

set -e

NAMESPACE="intelectgame"
HELM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../helm" && pwd)"

echo "🔍 Vérification du déploiement Helm..."
echo ""

# 1. Vérifier le namespace
echo "--- 1. Namespace ---"
if kubectl get namespace $NAMESPACE &> /dev/null; then
  echo "✅ Namespace $NAMESPACE existe"
else
  echo "❌ Namespace $NAMESPACE n'existe pas"
  echo "   Création..."
  kubectl create namespace $NAMESPACE
fi
echo ""

# 2. Vérifier les images Docker dans Minikube
echo "--- 2. Images Docker dans Minikube ---"
eval $(minikube docker-env)
IMAGES=("gamev2-auth-service:local" "gamev2-quiz-service:local" "gamev2-game-service:local" "gamev2-frontend:local" "gamev2-telegram-bot:local")
for img in "${IMAGES[@]}"; do
  if docker images | grep -q "$img"; then
    echo "✅ $img trouvé"
  else
    echo "❌ $img manquant"
  fi
done
echo ""

# 3. Vérifier la release Helm
echo "--- 3. Release Helm ---"
if helm list -n $NAMESPACE | grep -q "app"; then
  echo "✅ Release 'app' installée"
  helm status app -n $NAMESPACE
else
  echo "❌ Release 'app' non installée"
fi
echo ""

# 4. Vérifier les ressources déployées
echo "--- 4. Ressources dans le namespace ---"
echo "Deployments:"
kubectl get deployments -n $NAMESPACE
echo ""
echo "Services:"
kubectl get services -n $NAMESPACE
echo ""
echo "Pods:"
kubectl get pods -n $NAMESPACE
echo ""

# 5. Tester le template Helm
echo "--- 5. Validation du template Helm ---"
if helm template app "$HELM_DIR/app" --namespace $NAMESPACE &> /dev/null; then
  echo "✅ Template Helm valide"
else
  echo "❌ Erreur dans le template Helm:"
  helm template app "$HELM_DIR/app" --namespace $NAMESPACE 2>&1 | head -20
fi
echo ""

# 6. Suggestions
echo "--- 6. Suggestions ---"
if ! helm list -n $NAMESPACE | grep -q "app"; then
  echo "💡 Pour déployer:"
  echo "   ./k8s/local/scripts/deploy-local.sh"
  echo ""
  echo "💡 Ou manuellement:"
  echo "   helm install app $HELM_DIR/app -n $NAMESPACE"
fi


